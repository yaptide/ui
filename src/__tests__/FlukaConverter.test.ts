import { Builder, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import { byTestId } from '../test/seleniumUtils';
import { testIds } from '../util/testIds';

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
			await driver.wait(until.elementLocated(byTestId(testIds.navDrawer)), 5_000)
		).toBeTruthy();

		// Find and click the "Examples" button
		const examplesButton = await driver.findElement(byTestId(testIds.navItem('examples')));

		// Scroll into view to ensure the element is visible
		await driver.executeScript('arguments[0].scrollIntoView(true);', examplesButton);

		// Click the button
		await driver.wait(until.elementIsVisible(examplesButton), 5_000);
		await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
		await examplesButton.click();

		// Wait until the "Examples" panel is visible
		const flukaSection = await driver.wait(
			until.elementLocated(byTestId(testIds.examplesSection('FLUKA'))),
			10_000
		);

		// Scroll into view of the section
		await driver.executeScript('arguments[0].scrollIntoView(true);', flukaSection);

		// Ensure the section is visible
		expect(await flukaSection.isDisplayed()).toBeTruthy();

		// Find the first example in the "FLUKA" section
		const firstExample = await driver.findElement(byTestId(testIds.examplesChip('FLUKA', 0)));

		// Scroll into view of the first example
		await driver.executeScript('arguments[0].scrollIntoView(true);', firstExample);

		// Ensure the first example is visible
		expect(await firstExample.isDisplayed()).toBeTruthy();

		// Click the first example
		await firstExample.click();

		//wait for the "load file" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('load-file'))),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(
			await loadFileDialog.findElement(byTestId(testIds.dialogTitle('load-file'))).getText()
		).toBe('Load File Alert');

		expect(
			await loadFileDialog.findElement(byTestId(testIds.dialogContent('load-file'))).getText()
		).toBe('Loaded data will replace current project data. Are you sure you want to continue?');

		//check if the version warning is not present
		expect(
			await loadFileDialog.findElements(
				byTestId(`${testIds.dialog('load-file')}-version-warning`)
			)
		).toHaveLength(0);

		//find the "clear and proceed" button and click it
		const clearAndProceedButton = await loadFileDialog.findElement(
			byTestId(`${testIds.dialog('load-file')}-confirm`)
		);
		expect(await clearAndProceedButton.isEnabled()).toEqual(true);
		await clearAndProceedButton.click();

		//find the "Input Files" button on the left menu and click it to open the editor
		const filesButton = await driver.findElement(byTestId(testIds.navItem('inputFiles')));
		await filesButton.click();

		//wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
		const generateButton = await driver.wait(
			until.elementLocated(byTestId(testIds.inputEditorGenerate)),
			10_000
		);

		await driver.wait(until.elementIsEnabled(generateButton), 15_000);
		await generateButton.click();

		//wait until the text has appeared in the first text field
		await driver.wait(
			until.elementTextMatches(
				driver.findElement(byTestId(testIds.inputFileEditor('fl_sim.inp', 0))),
				/\S/
			)
		);

		//find the text field with config file and check if it is not empty
		const configText = await driver
			.findElement(byTestId(testIds.inputFileEditor('fl_sim.inp', 0)))
			.getText();
		expect(configText).not.toBe('');
	}, 50_000);
});
