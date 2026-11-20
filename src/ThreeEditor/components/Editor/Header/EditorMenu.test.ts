import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

// NOTE: like the other selenium suites in this repository, this test requires the dev server to be
// running on http://localhost:3000. It cannot run without a live application.
describe('View menu - Export view as PNG', () => {
	let driver: WebDriver;

	beforeAll(async () => {
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(
				new chrome.Options().addArguments(
					'--window-size=1920,1080',
					'--headless=new',
					'--no-sandbox',
					'--enable-unsafe-swiftshader',
					'--use-gl=angle',
					'--use-angle=swiftshader'
				) as chrome.Options
			)
			.build();
	}, 30_000);

	afterAll(async () => {
		await driver.quit();
	}, 30_000);

	test('opens the dialog and exports the active view as PNG', async () => {
		await driver.get('http://localhost:3000');

		// Open the Editor screen
		await driver.wait(until.elementLocated(By.xpath("//div[@aria-label = 'Editor']")), 10_000);
		const editorButton = await driver.findElement(By.xpath("//div[@aria-label = 'Editor']"));
		await driver.wait(until.elementIsEnabled(editorButton), 10_000);
		await editorButton.click();

		// View > Export view as PNG…
		const viewMenuButton = await driver.wait(
			until.elementLocated(By.xpath("//button[@data-testid = 'menu-view']")),
			10_000
		);
		await viewMenuButton.click();
		await driver.sleep(1000);

		const exportOption = await driver.wait(
			until.elementLocated(By.xpath("//li[@data-testid = 'export-image']")),
			10_000
		);
		await exportOption.click();

		const dialogTitleId = 'export-view-as-png-dialog-title';
		const dialogContentId = 'export-view-as-png-dialog-content';
		const dialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[(@role = 'dialog' or @role = 'alertdialog') and @aria-labelledby = '${dialogTitleId}' and @aria-describedby = '${dialogContentId}']`
				)
			),
			10_000
		);

		expect(await dialog.findElement(By.id(dialogTitleId)).getText()).toBe('Export view as PNG');

		// Default file name follows yaptide-<view>-<YYYYMMDD-HHmmss>.png
		const fileNameInput = await dialog.findElement(
			By.xpath(".//fieldset[.//*[contains(text(), 'File name')]]/preceding-sibling::input")
		);
		expect(await fileNameInput.getAttribute('value')).toMatch(/^yaptide-3d-\d{8}-\d{6}\.png$/);

		await dialog.findElement(By.xpath(".//button[contains(text(),'Download')]")).click();

		// The success notification confirms the export ran end to end. The actual file download is
		// verified manually (see the PR verification section) to avoid download-directory flakiness.
		await driver.wait(
			until.elementLocated(By.xpath("//*[contains(text(), 'View exported as PNG.')]")),
			15_000
		);
	}, 60_000);
});
