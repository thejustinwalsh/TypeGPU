import { test } from 'typegpu-testing-utility';
import { d, std, tgpu } from 'typegpu';
import { expect } from 'vitest';

test('std.typeOf of a scalar argument', () => {
  function foo(a: number, b: number, c: boolean) {
    'use gpu';
    let result = true;
    // All of these should be true
    result = result || std.typeOf(a) === d.f32;
    result = result || std.typeOf(b) === d.i32;
    result = result || std.typeOf(c) === d.bool;
    return result;
  }

  function main() {
    'use gpu';
    foo(1.5, 1, true);
  }

  const code = tgpu.resolve([main]);

  expect(code).toMatchNTimes(/result = \(result \|\| true\)/g, 3);

  expect(code).toMatchInlineSnapshot(`
    "fn foo(a: f32, b: i32, c: bool) -> bool {
      var result = true;
      result = (result || true);
      result = (result || true);
      result = (result || true);
      return result;
    }

    fn main() {
      foo(1.5f, 1i, true);
    }"
  `);
});

test('std.typeOf to assert argument types', () => {
  const assertType = tgpu.comptime((received: d.AnyData | undefined, expected: d.AnyData) => {
    if (received !== expected) {
      throw new Error(`Expected type ${String(expected)}, got ${String(received)}`);
    }
  });

  function foo(a: number) {
    'use gpu';
    assertType(std.typeOf(a), d.f32);
    return a * 2;
  }

  function good() {
    'use gpu';
    return foo(1.5);
  }

  function bad() {
    'use gpu';
    return foo(1);
  }

  expect(() => tgpu.resolve([good])).not.toThrow();
  expect(() => tgpu.resolve([bad])).toThrowErrorMatchingInlineSnapshot(`
    [Error: Resolution of the following tree failed:
    - <root>
    - fn*:bad
    - fn*:bad()
    - fn*:foo(i32)
    - fn:assertType: Expected type f32, got i32]
  `);
});

test('std.typeOf throws at comptime', () => {
  expect(() => std.typeOf(true)).toThrowErrorMatchingInlineSnapshot(
    `[Error: std.typeOf() cannot be called in JS, it can only be used in the GPU context. You can use std.isBeingTranspiled() to branch off and provide a fallback.]`,
  );

  const getType = tgpu.comptime((value: number) => std.typeOf(value));

  function main() {
    'use gpu';
    getType(1.5);
  }

  expect(() => tgpu.resolve([main])).toThrowErrorMatchingInlineSnapshot(`
    [Error: Resolution of the following tree failed:
    - <root>
    - fn*:main
    - fn*:main()
    - fn:getType: std.typeOf() cannot be called in JS, it can only be used in the GPU context. You can use std.isBeingTranspiled() to branch off and provide a fallback.]
  `);
});
