import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('Editor sidebar', () => {
	let driver: WebDriver;

	const sectionXPath = (title: string) =>
		`//div[contains(@class, 'MuiAccordion-root')][./div/button[contains(@class, 'MuiAccordionSummary-root')]//p[text() = '${title}']]`;

	const summaryXPath = (title: string) =>
		`${sectionXPath(title)}/div/button[contains(@class, 'MuiAccordionSummary-root')]`;

	const treeItemXPath = (title: string, name: string) =>
		`${sectionXPath(title)}//ul[contains(@class, 'editor-sidebar-tree')]//div[@id][.//span[text() = '${name}']]`;

	const toggleIconXPath = (title: string, name: string) =>
		`${treeItemXPath(title, name)}/*[name() = 'svg' and (@data-testid = 'AddIcon' or @data-testid = 'RemoveIcon')]`;

	async function waitForExpanded(title: string, expanded: boolean) {
		await driver.wait(
			until.elementLocated(
				By.xpath(`${summaryXPath(title)}[@aria-expanded = '${expanded}']`)
			),
			5_000
		);
	}

	async function waitForTreeItem(title: string, name: string) {
		const item = await driver.wait(
			until.elementLocated(By.xpath(treeItemXPath(title, name))),
			5_000
		);
		await driver.wait(until.elementIsVisible(item), 5_000);
	}

	async function addFromObjectMenu(label: string) {
		await driver.findElement(By.id('menu-button-21')).click();

		const option = await driver.wait(
			until.elementLocated(By.xpath(`//*[@id = 'menu-content-21']//li[text() = '${label}']`)),
			5_000
		);
		await driver.wait(until.elementIsVisible(option), 5_000);
		await option.click();

		await driver.wait(
			until.stalenessOf(await driver.findElement(By.id('menu-content-21'))),
			5_000
		);
	}

	async function waitForTreeItemHidden(title: string, name: string) {
		await driver.wait(async () => {
			const items = await driver.findElements(By.xpath(treeItemXPath(title, name)));
			const visible = await Promise.all(items.map(item => item.isDisplayed()));

			return !visible.includes(true);
		}, 5_000);
	}

	async function hasSecondaryColor(element: WebElement) {
		return ((await element.getAttribute('class')) ?? '').includes('MuiSvgIcon-colorSecondary');
	}

	beforeAll(async () => {
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(
				new chrome.Options().addArguments(
					'--window-size=1920,1080',
					'--headless'
				) as chrome.Options
			)
			.build();

		await driver.get('http://localhost:3000');

		const editorButton = await driver.wait(
			until.elementLocated(By.xpath("//div[@aria-label = 'Editor']")),
			5_000
		);
		await driver.wait(until.elementIsEnabled(editorButton), 5_000);
		await editorButton.click();

		await driver.wait(until.elementLocated(By.id('menu-button-21')), 10_000);
	}, 30_000);

	afterAll(async () => {
		await driver.quit();
	}, 30_000);

	test('Adding a figure expands the collapsed Figures section', async () => {
		await waitForExpanded('Figures', false);

		await addFromObjectMenu('Box');

		await waitForExpanded('Figures', true);
		await waitForTreeItem('Figures', 'Box');

		await driver.findElement(By.xpath(summaryXPath('Figures'))).click();
		await waitForExpanded('Figures', false);

		const expandIcon = await driver.findElement(
			By.xpath(`${summaryXPath('Figures')}//*[@data-testid = 'ExpandMoreIcon']`)
		);
		await driver.wait(async () => hasSecondaryColor(expandIcon), 5_000);
	}, 30_000);

	test('Adding a quantity opens its output, also after coming back to the tab', async () => {
		await addFromObjectMenu('Output');

		await waitForExpanded('Outputs', true);
		await waitForTreeItem('Outputs', 'Output');

		await addFromObjectMenu('Quantity');

		await waitForTreeItem('Outputs', 'Quantity_1');

		await driver.findElement(By.xpath(toggleIconXPath('Outputs', 'Output'))).click();
		await waitForTreeItemHidden('Outputs', 'Quantity_1');

		const collapsedIcon = await driver.findElement(
			By.xpath(toggleIconXPath('Outputs', 'Output'))
		);
		expect(await collapsedIcon.getAttribute('data-testid')).toBe('AddIcon');
		expect(await hasSecondaryColor(collapsedIcon)).toBe(true);

		await driver.findElement(By.xpath("//button[@role = 'tab' and . = 'Geometry']")).click();
		await waitForExpanded('Figures', true);
		await waitForTreeItem('Figures', 'Box');

		await driver.findElement(By.xpath("//button[@role = 'tab' and . = 'Scoring']")).click();

		await waitForExpanded('Outputs', true);
		await waitForTreeItem('Outputs', 'Quantity_1');
	}, 30_000);
});
