import { Builder, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import { byTestId } from '../../../test/seleniumUtils';
import { testIds } from '../../../util/testIds';

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
		await driver.wait(until.elementLocated(byTestId(testIds.navItem('examples'))), 5_000);

		const examplesButton = await driver.findElement(byTestId(testIds.navItem('examples')));
		await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
		await examplesButton.click();

		// Wait until the "Examples" panel is visible
		await driver.wait(
			until.elementLocated(byTestId(testIds.examplesSection(sectionName))),
			10_000
		);

		// Find the first example in the section and click it
		const firstExample = await driver.findElement(
			byTestId(testIds.examplesChip(sectionName, 0))
		);
		await firstExample.isDisplayed();
		await firstExample.click();

		//wait for the "load file" dialog to appear
		const loadFileDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('load-file'))),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		//find the "clear and proceed" button and click it
		const clearAndProceedButton = await loadFileDialog.findElement(
			byTestId(`${testIds.dialog('load-file')}-confirm`)
		);
		expect(await clearAndProceedButton.isEnabled()).toEqual(true);
		await clearAndProceedButton.click();
	}

	test('Geant4 should connect and be able to run', async () => {
		await loadExample('GEANT4');

		expect(await driver.findElement(byTestId(testIds.simulatorStatus)).getText()).toEqual(
			'Connected'
		);

		expect(await driver.findElement(byTestId(testIds.simulatorSelect)).getText()).toEqual(
			'Geant4'
		);

		const runButton = await driver.findElement(byTestId(testIds.simulatorRun));
		expect(await runButton.isEnabled()).toBeTruthy();

		await runButton.click();

		const simulationsTab = await driver.wait(
			until.elementLocated(byTestId(testIds.navItem('simulations'))),
			10_000
		);
		expect(simulationsTab).toBeTruthy();
	}, 50_000);

	test('SHIELD-HIT12A should be unreachable', async () => {
		// The test is run without server running, so it makes sense
		await loadExample('SHIELDHIT');

		expect(await driver.findElement(byTestId(testIds.simulatorStatus)).getText()).toEqual(
			'Unreachable'
		);

		expect(await driver.findElement(byTestId(testIds.simulatorSelect)).getText()).toEqual(
			'SHIELD-HIT12A'
		);

		const runButton = await driver.findElement(byTestId(testIds.simulatorRun));
		expect(await runButton.isEnabled()).toBeFalsy();
	}, 50_000);

	test('Switching from Geant4 should clear the project', async () => {
		await loadExample('GEANT4');

		const simulatorSelect = await driver.findElement(byTestId(testIds.simulatorSelect));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(byTestId(testIds.simulatorPopover));

		const shieldhitOption = await popoverList.findElement(
			byTestId(testIds.simulatorOption('shieldhit'))
		);
		await shieldhitOption.click();

		const alertTitle = testIds.dialogTitle('simulator-change');
		const alertContent = testIds.dialogContent('simulator-change');

		//wait for the "Simulator Change Alert" dialog to appear
		const changeDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('simulator-change'))),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await changeDialog.findElement(byTestId(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await changeDialog.findElement(byTestId(alertContent)).getText()).toBe(
			'Changing the simulator will clear the project. Are you sure you want to continue?'
		);
	}, 50_000);

	test('Switching to Geant4 should clear the project', async () => {
		await loadExample('SHIELDHIT');

		const simulatorSelect = await driver.findElement(byTestId(testIds.simulatorSelect));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(byTestId(testIds.simulatorPopover));

		const geant4Option = await popoverList.findElement(
			byTestId(testIds.simulatorOption('geant4'))
		);
		await geant4Option.click();

		const alertTitle = testIds.dialogTitle('simulator-change');
		const alertContent = testIds.dialogContent('simulator-change');

		//wait for the "Simulator Change Alert" dialog to appear
		const changeDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('simulator-change'))),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await changeDialog.findElement(byTestId(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await changeDialog.findElement(byTestId(alertContent)).getText()).toBe(
			'Changing the simulator will clear the project. Are you sure you want to continue?'
		);
	}, 50_000);

	test('Switching between SHIELD-HIT12A and FLUKA should clear the project partially', async () => {
		await loadExample('SHIELDHIT');

		const simulatorSelect = await driver.findElement(byTestId(testIds.simulatorSelect));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(byTestId(testIds.simulatorPopover));

		const flukaOption = await popoverList.findElement(
			byTestId(testIds.simulatorOption('fluka'))
		);

		await flukaOption.click();

		const alertTitle = testIds.dialogTitle('simulator-change');
		const alertContent = testIds.dialogContent('simulator-change');

		//wait for the "Simulator Change Alert" dialog to appear
		const changeDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('simulator-change'))),
			10_000
		);

		await driver.sleep(1000); // wait for modal to fade in

		expect(await changeDialog.findElement(byTestId(alertTitle)).getText()).toBe(
			'Simulator Change Alert'
		);

		expect(await changeDialog.findElement(byTestId(alertContent)).getText()).toBe(
			"Changing to another simulator may result in data loss. It is only recommended to change from the 'Common' simulator to either 'Fluka' or 'Shieldhit'. Are you sure you want to continue?"
		);
	}, 50_000);

	test('Switching from COMMON to SHIELD-HIT12A should work fine', async () => {
		await loadExample('COMMON');

		const simulatorSelect = await driver.findElement(byTestId(testIds.simulatorSelect));
		await simulatorSelect.click();

		// Allow for popover to fade in
		await driver.sleep(1000);

		const popoverList = await driver.findElement(byTestId(testIds.simulatorPopover));

		const shieldhitOption = await popoverList.findElement(
			byTestId(testIds.simulatorOption('shieldhit'))
		);
		await shieldhitOption.click();

		// Wait for simulator change to happen
		await driver.sleep(1000);

		expect(await simulatorSelect.getText()).toEqual('SHIELD-HIT12A');
	}, 50_000);
});
