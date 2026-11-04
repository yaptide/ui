import { Builder, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import { byTestId } from '../../../test/seleniumUtils';
import { testIds } from '../../../util/testIds';

describe('Project Menu', () => {
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

	test('New item should clear the project and ask for new description', async () => {
		await driver.get('http://localhost:3000');

		// Open Editor screen

		// Wait for "Editor" button being enabled and click it
		await driver.wait(until.elementLocated(byTestId(testIds.navItem('editor'))), 5_000);

		const editorButton = await driver.findElement(byTestId(testIds.navItem('editor')));
		await driver.wait(until.elementIsEnabled(editorButton), 5_000);
		await editorButton.click();

		// Click Project > New

		// Wait for Project menu to be visible
		await driver.wait(until.elementLocated(byTestId(testIds.menuButton('project'))), 5_000);

		const projectMenuButton = await driver.findElement(byTestId(testIds.menuButton('project')));
		await projectMenuButton.click();

		// Wait for menu popup to fade in;
		await driver.sleep(1000);

		const newOption = await driver
			.findElement(byTestId(testIds.menuPopup('project')))
			.findElement(byTestId(testIds.menuItem('project', 0)));
		await newOption.click();

		// Creating new project clears previous state, acknowledge the alert

		const newProjectTitle = testIds.dialogTitle('new-project');
		const newProjectContent = testIds.dialogContent('new-project');

		// wait for the New Project Alert
		const newProjectDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('new-project'))),
			10_000
		);

		expect(await newProjectDialog.findElement(byTestId(newProjectTitle)).getText()).toBe(
			'New Project Alert'
		);

		expect(await newProjectDialog.findElement(byTestId(newProjectContent)).getText()).toBe(
			'Your current project will be lost. Are you sure you want to continue?'
		);

		const confirmButton = await newProjectDialog.findElement(
			byTestId(`${testIds.dialog('new-project')}-confirm`)
		);
		await confirmButton.click();

		// The application asks for title and description in a separate dialog

		const projectDescriptionTitle = testIds.dialogTitle('edit-project');
		const projectDescriptionContent = testIds.dialogContent('edit-project');

		//wait for the Edit Project Info dialog
		const projectDescriptionDialog = await driver.wait(
			until.elementLocated(byTestId(testIds.dialog('edit-project'))),
			10_000
		);

		expect(
			await projectDescriptionDialog.findElement(byTestId(projectDescriptionTitle)).getText()
		).toBe('Edit Project Info');

		expect(
			await projectDescriptionDialog
				.findElement(byTestId(projectDescriptionContent))
				.getText()
		).toBe('Change title or description for current project.');

		// Input new title and description

		const titleInput = await projectDescriptionDialog.findElement(
			byTestId('edit-project-title-input')
		);
		await titleInput.sendKeys('\b\b\b\b\b\b\b\b\b\b\b\b\b\b\bMy Title'); // \b backspace to remove default title

		const descriptionInput = await projectDescriptionDialog.findElement(
			byTestId('edit-project-description-input')
		);
		await descriptionInput.sendKeys('My Description');

		await projectDescriptionDialog
			.findElement(byTestId(`${testIds.dialog('edit-project')}-save`))
			.click();

		// Give it time to reload
		await driver.sleep(1000);

		// Verify the title and description

		const header = await driver.findElement(byTestId(testIds.projectTitleButton));
		expect(await header.getText()).toEqual('My Title');

		await header.click();

		await driver.sleep(1000);

		const descriptionText = await driver
			.findElement(byTestId(testIds.dialog('edit-project')))
			.findElement(byTestId('edit-project-description-input'))
			.getText();
		expect(descriptionText).toEqual('My Description');
	}, 50_000);
});
