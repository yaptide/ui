import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('Fluka Converter', () => {
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
	//test timeouts are set to 30000 ms, as default timeout of 5000 ms is not enough for the test to pass in github actions

	afterAll(async () => {
		await driver.quit();
	}, 30_000);

	//this test checks if converter works correctly - opens an example and generates config files
	test('converter generates correct files', async () => {
		await driver.get('http://localhost:3000');

		// Wait for the application to load
		expect(
			await driver.wait(
				until.elementLocated(
					By.xpath("//div[@aria-label = 'Navigation drawer for the YAPTIDE application']")
				),
				5_000
			)
		).toBeTruthy();

		// Find and click the "Examples" button
		const examplesButton = await driver.findElement(
			By.xpath("//div[@aria-label = 'Examples']")
		);

		// Scroll into view to ensure the element is visible
		await driver.executeScript('arguments[0].scrollIntoView(true);', examplesButton);

		// Click the button
		await driver.wait(until.elementIsVisible(examplesButton), 5_000);
		await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
		await examplesButton.click();

		// Wait until the "Examples" button is marked as active
		await driver.wait(
			until.elementLocated(
				By.xpath("//div[@aria-label = 'Examples' and @aria-selected = 'true']")
			),
			10_000
		);

		// Find the "FLUKA" section header
		const flukaSectionHeader = await driver.findElement(By.xpath("//h5[text()='FLUKA']"));

		// Scroll into view of the header
		await driver.executeScript('arguments[0].scrollIntoView(true);', flukaSectionHeader);

		// Ensure the section header is visible
		expect(await flukaSectionHeader.isDisplayed()).toBeTruthy();

		// Find the first example in the "FLUKA" section
		const firstExample = await driver.findElement(
			By.xpath(
				"//h5[text()='FLUKA']/following-sibling::div//div[contains(@class, 'MuiPaper-root')][1]"
			)
		);

		// Scroll into view of the first example
		await driver.executeScript('arguments[0].scrollIntoView(true);', firstExample);

		// Ensure the first example is visible
		expect(await firstExample.isDisplayed()).toBeTruthy();

		// Click the first example
		await firstExample.click();

		// Check if the tab switched to "Editor"
		const editorTab = await driver.wait(
			until.elementLocated(
				By.xpath("//div[@aria-label = 'Editor' and @aria-selected = 'true']")
			),
			10_000
		);

		expect(editorTab).toBeTruthy();

		const loadFileTitleId = 'load-file-alert-dialog-title';
		const loadFileContentId = 'load-file-alert-dialog-content';
		const versionWarningId = 'load-file-dialog-version-warning';

		//wait for the "load file" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${loadFileTitleId}' and @aria-describedby = '${loadFileContentId}']`
				)
			),
			10_000
		);

		expect(await loadFileDialog.findElement(By.id(loadFileTitleId)).getText()).toBe(
			'Load File Alert'
		);

		expect(await loadFileDialog.findElement(By.id(loadFileContentId)).getText()).toBe(
			'Loaded data will replace current project data. Are you sure you want to continue?'
		);

		//check if the version warning is not present
		expect(await loadFileDialog.findElements(By.id(versionWarningId))).toHaveLength(0);

		//find the "clear and proceed" button and click it
		const clearAndProceedButton = await loadFileDialog.findElement(
			By.xpath("//button[contains(text(),'Clear and proceed')]")
		);
		expect(await clearAndProceedButton.isEnabled()).toEqual(true);
		await clearAndProceedButton.click();

		//find the "Input Files" button on the left menu and click it to open the editor
		const filesButton = await driver.findElement(
			By.xpath("//div[@aria-label = 'Input files']")
		);
		await filesButton.click();
		expect(
			await driver.wait(
				until.elementLocated(
					By.xpath("//div[@aria-label = 'Input files' and @aria-selected = 'true']")
				),
				10_000
			)
		).toBeTruthy();

		//wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
		//xpath is used as again the id changes every time
		const generateButton = await driver.findElement(
			By.xpath("//span[contains(text(),'Generate from Editor')]")
		);
		await driver.wait(until.elementIsEnabled(generateButton), 15_000);
		await generateButton.click();

		//wait until the text has appeared in the first text field
		await driver.wait(
			until.elementTextMatches(
				driver.findElement(By.xpath("//textarea[@aria-label = 'fl_sim.inp text field']")),
				/\S/
			)
		);

		//find the text field with config file and check if it is not empty
		const configText = await driver
			.findElement(By.xpath("//textarea[@aria-label = 'fl_sim.inp text field']"))
			.getText();
		expect(configText).not.toBe('');
	}, 50_000);
});
