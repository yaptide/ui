import { By } from 'selenium-webdriver';

// Selenium does not support semantic (role/name) selectors, so E2E tests locate
// elements via `data-testid`. Values come from `src/util/testIds.ts`.
export const byTestId = (id: string) => By.css(`[data-testid="${id}"]`);
