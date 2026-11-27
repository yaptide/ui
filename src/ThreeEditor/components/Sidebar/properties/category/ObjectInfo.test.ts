import { Builder, By, Key, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('ObjectInfo name field', () => {
	let driver: WebDriver;

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
	}, 30_000);

	afterAll(async () => {
		await driver.quit();
	}, 30_000);

	const nameInputXPath =
		"//div[normalize-space(text()) = 'Name']/following-sibling::div[1]//input";

	const clickVisible = async (xpath: string) => {
		const element = await driver.wait(until.elementLocated(By.xpath(xpath)), 5_000);
		await driver.wait(until.elementIsVisible(element), 5_000);
		await driver.wait(until.elementIsEnabled(element), 5_000);
		await element.click();
	};

	const expandAccordion = (title: string) =>
		clickVisible(
			`//*[contains(@class, 'MuiAccordionSummary-root')][normalize-space() = '${title}']`
		);

	const clickAddButton = (label: string) =>
		clickVisible(`//button[normalize-space() = '${label}']`);

	const waitForValue = async (input: WebElement, value: string) => {
		await driver.wait(async () => (await input.getAttribute('value')) === value, 5_000);
	};

	test('name gets a unique suffix only after Enter', async () => {
		await driver.get('http://localhost:3000');

		await clickVisible("//div[@aria-label = 'Editor']");
		await expandAccordion('Figures');

		await clickAddButton('Box');
		await clickAddButton('Box');
		await clickAddButton('Sphere');

		await expandAccordion('Information');

		const nameInput = await driver.wait(until.elementLocated(By.xpath(nameInputXPath)), 5_000);
		await driver.wait(until.elementIsVisible(nameInput), 5_000);
		await waitForValue(nameInput, 'Sphere');

		await nameInput.click();
		await nameInput.sendKeys(Key.END, ...Array<string>('Sphere'.length).fill(Key.BACK_SPACE));
		await nameInput.sendKeys('Box');

		expect(await nameInput.getAttribute('value')).toBe('Box');
		expect(
			await driver.findElements(By.xpath("//span[normalize-space() = 'Box_2']"))
		).toHaveLength(0);

		await nameInput.sendKeys(Key.ENTER);

		await waitForValue(nameInput, 'Box_2');
		expect(
			await driver.findElements(By.xpath("//span[normalize-space() = 'Box_2']"))
		).toHaveLength(1);
	}, 30_000);
});
