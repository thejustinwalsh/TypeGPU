import { AutoStruct } from '../data/autoStruct.ts';
import { UnknownData, type AnyData } from '../data/dataTypes.ts';
import { $gpuCallable, $internal } from '../shared/symbols.ts';
import { coerceToSnippet } from '../tgsl/generationHelpers.ts';
import type { GPUCallable } from '../types.ts';

interface TypeOf extends GPUCallable {
  (arg: unknown): AnyData | undefined;
}

/**
 * Returns the type of an expression, the one it will have during shader execution. That information can
 * be used to introspect or specialize the shader. It will return `undefined` if the expression cannot
 * be represented in shader code, or if the type is unknown at the point where the query is made.
 *
 * @example
 * function double(value: number) {
 *   'use gpu';
 *   if (std.typeOf(value) === d.f32) {
 *     return value * 2;
 *   }
 *   return value << 1;
 * }
 *
 * function main() {
 *   'use gpu';
 *   double(1.5); // generates double(f32), which multiplies by 2
 *   double(1); // generates double(i32), which shifts left by 1
 * }
 */
export const typeOf = ((): TypeOf => {
  const impl = (() => {
    // Deducing the WGSL type of a value at comptime is near-impossible with
    // the current comptime type flowing. We can lift this restriction once it
    // becomes more capable.
    throw new Error(
      'std.typeOf() cannot be called in JS, it can only be used in the GPU context. You can use std.isBeingTranspiled() to branch off and provide a fallback.',
    );
  }) as unknown as TypeOf;

  impl.toString = () => 'typeOf';
  impl[$gpuCallable] = {
    call(_ctx, args) {
      const [arg] = args;
      if (!arg || args.length > 1) {
        throw new Error(`std.typeOf() expects exactly one argument, got ${args.length}`);
      }
      const type = arg.dataType;
      if (type === UnknownData || type instanceof AutoStruct) {
        return coerceToSnippet(undefined);
      }

      return coerceToSnippet(type);
    },
  };
  // Mark as internal
  Object.defineProperty(impl, $internal, {});

  return impl;
})();
