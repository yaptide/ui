import { By, until, WebDriver } from 'selenium-webdriver';

// Selenium does not support semantic (role/name) selectors, so E2E tests locate
// elements via `data-testid`. Values come from `src/util/testIds.ts`.
export const byTestId = (id: string) => By.css(`[data-testid="${id}"]`);

// Locates a navigation item that is currently the active page. Unlike `byTestId`,
// which matches the item even when it is not selected, `aria-current` is only set
// on the selected item (`NavPanelElement`), so waiting for this locator also
// asserts that navigation actually happened.
export const activeNavItem = (id: string) => By.css(`[data-testid="${id}"][aria-current="page"]`);

// `until.elementLocated` would resolve immediately because persistent TabPanels keep their hidden
// children mounted, so wait for the element to actually be visible instead.
export async function waitForVisibleByTestId(driver: WebDriver, id: string, timeout: number) {
	const element = await driver.wait(until.elementLocated(byTestId(id)), timeout);

	return driver.wait(until.elementIsVisible(element), timeout);
}
