// src/test-utils/jest-dom.d.ts
import '@testing-library/jest-dom';

type CustomMatchers<R = unknown> = {
  toBeInTheDocument(): R;
  toHaveTextContent(text: string | RegExp): R;
  toBeVisible(): R;
  toHaveClass(className: string): R;
  toHaveStyle(css: Record<string, unknown>): R;
};

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}