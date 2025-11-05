import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

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
		await driver.wait(until.elementLocated(By.xpath("//div[@aria-label = 'Editor']")), 5_000);

		const examplesButton = await driver.findElement(By.xpath("//div[@aria-label = 'Editor']"));
		await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
		await examplesButton.click();

		// Click Project > New

		// Wait for Project menu to be visible
		await driver.wait(
			until.elementLocated(By.xpath("//button[@id = 'menu-button-10']")),
			5_000
		);

		const projectMenuButton = await driver.findElement(
			By.xpath("//button[@id = 'menu-button-10']")
		);
		await projectMenuButton.click();

		// Wait for menu popup to fade in;
		await driver.sleep(1000);

		const newOption = await driver
			.findElement(By.xpath("//div[@id = 'menu-content-10']"))
			.findElement(By.xpath(".//*[contains(text(), 'New')]"));
		await newOption.click();

		// Creating new project clears previous state, acknowledge the alert

		const newProjectTitleId = 'new-project-alert-dialog-title';
		const newProjectContentId = 'new-project-alert-dialog-content';

		// wait for the New Project Alert
		const newProjectDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${newProjectTitleId}' and @aria-describedby = '${newProjectContentId}']`
				)
			),
			10_000
		);

		expect(await newProjectDialog.findElement(By.id(newProjectTitleId)).getText()).toBe(
			'New Project Alert'
		);

		expect(await newProjectDialog.findElement(By.id(newProjectContentId)).getText()).toBe(
			'Your current project will be lost. Are you sure you want to continue?'
		);

		const confirmButton = await newProjectDialog.findElement(
			By.xpath(".//button[contains(text(),'Clear and proceed')]")
		);
		await confirmButton.click();

		// The application asks for title and description in a separate dialog

		const projectDescriptionTitleId = 'edit-project-info-dialog-title';
		const projectDescriptionContentId = 'edit-project-info-dialog-content';

		//wait for the Edit Project Info dialog
		const projectDescriptionDialog = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${projectDescriptionTitleId}' and @aria-describedby = '${projectDescriptionContentId}']`
				)
			),
			10_000
		);

		expect(
			await projectDescriptionDialog.findElement(By.id(projectDescriptionTitleId)).getText()
		).toBe('Edit Project Info');

		expect(
			await projectDescriptionDialog.findElement(By.id(projectDescriptionContentId)).getText()
		).toBe('Change title or description for current project.');

		// Input new title and description

		const titleInput = await projectDescriptionDialog.findElement(
			By.xpath(
				".//fieldset[.//*[contains(text(), 'Project Title')]]/preceding-sibling::input"
			)
		);
		await titleInput.sendKeys('\b\b\b\b\b\b\b\b\b\b\b\b\b\b\bMy Title'); // \b backspace to remove default title

		const descriptionInput = await projectDescriptionDialog.findElement(
			By.xpath(
				".//fieldset[.//*[contains(text(), 'Project Description')]]/preceding-sibling::textarea"
			)
		);
		await descriptionInput.sendKeys('My Description');

		await projectDescriptionDialog
			.findElement(By.xpath(".//button[contains(text(),'Save')]"))
			.click();

		// Give it time to reload
		await driver.sleep(1000);

		// Verify the title and description

		const header = await driver.findElement(By.xpath("//div[@role = 'heading']"));
		expect(await header.getText()).toEqual('My Title');

		await header.click();

		await driver.sleep(1000);

		const descriptionText = await driver
			.findElement(
				By.xpath(
					`//div[@role = 'dialog' and @aria-labelledby = '${projectDescriptionTitleId}' and @aria-describedby = '${projectDescriptionContentId}']`
				)
			)
			.findElement(
				By.xpath(
					".//fieldset[.//*[contains(text(), 'Project Description')]]/preceding-sibling::textarea"
				)
			)
			.getText();
		expect(descriptionText).toEqual('My Description');
	}, 50_000);
});
