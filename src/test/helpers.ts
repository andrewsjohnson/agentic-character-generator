import { screen } from '@testing-library/react';

export function getSelectByTestId(testId: string): HTMLSelectElement {
  const element = screen.getByTestId(testId);
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error(`Element with testId "${testId}" is not an HTMLSelectElement`);
  }
  return element;
}
