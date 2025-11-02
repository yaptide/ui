import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('Simulation Controls', () => {
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

	// Common code to load an example
	async function loadExample(sectionName: 'GEANT4' | 'SHIELDHIT' | 'COMMON') {
		await driver.get('http://localhost:3000');

		// Wait for "Examples" button being enabled and click it
		await driver.wait(until.elementLocated(By.xpath("//div[@aria-label = 'Examples']")), 5_000);

		const examplesButton = await driver.findElement(
			By.xpath("//div[@aria-label = 'Examples']")
		);
		await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
		await examplesButton.click();

		// Wait until the "Examples" button is marked as active
		await driver.wait(
			until.elementLocated(
				By.xpath("//div[@aria-label = 'Examples' and @aria-selected = 'true']")
			),
			10_000
		);

		// Find the section header
		const geant4SectionHeader = await driver.findElement(
			By.xpath(`//h5[text()='${sectionName}']`)
		);
		await geant4SectionHeader.isDisplayed();

		// Find the first example in the section and click it
		const firstExample = await driver.findElement(
			By.xpath(
				`//h5[text()='${sectionName}']/following-sibling::div//div[contains(@class, 'MuiChip-root')][1]`
			)
		);
		await firstExample.isDisplayed();
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

		//wait for the "load file" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${loadFileTitleId}' and @aria-describedby = '${loadFileContentId}']`
				)
			),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		//find the "clear and proceed" button and click it
		const clearAndProceedButton = await loadFileDialog.findElement(
			By.xpath("//button[contains(text(),'Clear and proceed')]")
		);
		expect(await clearAndProceedButton.isEnabled()).toEqual(true);
		await clearAndProceedButton.click();
	}

	test('Geant4 should connect and be able to run', async () => {
		await loadExample('GEANT4');

		expect(await driver.findElement(By.id('simulator-controls-status')).getText()).toEqual(
			'Connected'
		);

		expect(await driver.findElement(By.id('simulator-controls-select')).getText()).toEqual(
			'Geant4'
		);

		const runButton = await driver.findElement(By.id('simulator-controls-run'));
		expect(await runButton.isEnabled()).toBeTruthy();

		await runButton.click();

		const simulationsTab = await driver.wait(
			until.elementLocated(
				By.xpath("//div[@aria-label = 'Simulations' and @aria-selected = 'true']")
			),
			10_000
		);
		expect(simulationsTab).toBeTruthy();
	}, 50_000);

	test('SHIELD-HIT12A should be unreachable', async () => {
		// The test is run without server running, so it makes sense
		await loadExample('SHIELDHIT');

		expect(await driver.findElement(By.id('simulator-controls-status')).getText()).toEqual(
			'Unreachable'
		);

		expect(await driver.findElement(By.id('simulator-controls-select')).getText()).toEqual(
			'SHIELD-HIT12A'
		);

		const runButton = await driver.findElement(By.id('simulator-controls-run'));
		expect(await runButton.isEnabled()).toBeFalsy();
	});

	test('Switching from Geant4 should clear the project', async () => {
		await loadExample('GEANT4');

		const simulatorSelect = await driver.findElement(By.id('simulator-controls-select'));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(By.id('simulator-controls-popover-select'));

		const shieldhitOption = await popoverList.findElement(
			By.xpath("//div[./*[contains(text(), 'SHIELD-HIT12A')]]")
		);
		await shieldhitOption.click();

		const alertTitle = 'simulator-change-alert-dialog-title';
		const alertContent = 'simulator-change-alert-dialog-content';

		//wait for the "Simulator Change Alert" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${alertTitle}' and @aria-describedby = '${alertContent}']`
				)
			),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await loadFileDialog.findElement(By.id(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await loadFileDialog.findElement(By.id(alertContent)).getText()).toBe(
			'Changing the simulator will clear the project. Are you sure you want to continue?'
		);
	}, 50_000);

	test('Switching to Geant4 should clear the project', async () => {
		await loadExample('SHIELDHIT');

		const simulatorSelect = await driver.findElement(By.id('simulator-controls-select'));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(By.id('simulator-controls-popover-select'));

		const geant4Option = await popoverList.findElement(
			By.xpath("//div[./*[contains(text(), 'Geant4')]]")
		);
		await geant4Option.click();

		const alertTitle = 'simulator-change-alert-dialog-title';
		const alertContent = 'simulator-change-alert-dialog-content';

		//wait for the "Simulator Change Alert" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${alertTitle}' and @aria-describedby = '${alertContent}']`
				)
			),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await loadFileDialog.findElement(By.id(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await loadFileDialog.findElement(By.id(alertContent)).getText()).toBe(
			'Changing the simulator will clear the project. Are you sure you want to continue?'
		);
	}, 50_000);

	test('Switching between SHIELD-HIT12A and FLUKA should clear the project partially', async () => {
		await loadExample('SHIELDHIT');

		const simulatorSelect = await driver.findElement(By.id('simulator-controls-select'));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(By.id('simulator-controls-popover-select'));

		const flukaOption = await popoverList.findElement(
			By.xpath("//div[./*[contains(text(), 'FLUKA instance')]]")
		);

		await flukaOption.click();

		const alertTitle = 'simulator-change-alert-dialog-title';
		const alertContent = 'simulator-change-alert-dialog-content';

		//wait for the "Simulator Change Alert" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${alertTitle}' and @aria-describedby = '${alertContent}']`
				)
			),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await loadFileDialog.findElement(By.id(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await loadFileDialog.findElement(By.id(alertContent)).getText()).toBe(
			"Changing to another simulator may result in data loss. It is only recommended to change from the 'Common' simulator to either 'Fluka' or 'Shieldhit'. Are you sure you want to continue?"
		);
	}, 50_000);

	test('Switching from COMMON to SHIELD-HIT12A should work fine', async () => {
		await loadExample('COMMON');

		const simulatorSelect = await driver.findElement(By.id('simulator-controls-select'));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(By.id('simulator-controls-popover-select'));

		const shieldhitOption = await popoverList.findElement(
			By.xpath("//div[./*[contains(text(), 'SHIELD-HIT12A')]]")
		);
		await shieldhitOption.click();

		// Wait for simulator change to happen
		await driver.sleep(1000);

		expect(await simulatorSelect.getText()).toEqual('SHIELD-HIT12A');
	}, 50_000);
});
