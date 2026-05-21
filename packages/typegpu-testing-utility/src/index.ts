import { expect } from 'vitest';

declare module 'vitest' {
  // oxlint-disable-next-line typescript/no-explicit-any -- must match vitest's declaration
  interface Matchers<T = any> {
    toMatchNTimes: (regexp: RegExp, expectedMatches: number) => T;
  }
}

expect.extend({
  toMatchNTimes(received, regexp, expectedMatches) {
    const { isNot } = this;

    let occurrances = 0;

    while (regexp.exec(received) !== null) {
      occurrances++;
    }

    return {
      pass: occurrances === expectedMatches,
      actual: occurrances,
      expected: expectedMatches,
      message: () =>
        isNot
          ? `${received} shouldn't contain the pattern ${expectedMatches} times`
          : `${received} should contain the pattern ${expectedMatches} times`,
    };
  },
});

export {
  it,
  test,
  type MockCommandEncoder,
  type MockComputePassEncoder,
  type MockDevice,
  type MockRenderBundleEncoder,
  type MockRenderPassEncoder,
} from './extendedIt.ts';
export { CAPTURE, captureSnippets, simplifyType } from './capture.ts';
