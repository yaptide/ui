import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('Fluka Converter', () => {
	let driver: WebDriver;

	beforeAll(async () => {
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(
				new chrome.Options().headless().addArguments('--window-size=1920,1080')
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

		//find the "Editor" button on the left menu and assure it is already selected
		const editorButton = await driver.findElement(By.xpath("//div[@aria-label = 'Editor']"));

		if ((await editorButton.getAttribute('aria-selected')) !== 'true')
			console.warn(
				`Editor button is not selected even though it should be it's default state.`
			);
		await editorButton.click().then(async () => {
			//click rerenders the nav drawer, so we need to wait for it to rerender
			expect(
				await driver.wait(
					until.elementLocated(
						By.xpath("//div[@aria-label = 'Editor' and @aria-selected = 'true']")
					),
					10_000
				)
			).toBeTruthy();
		});

		//find the "open" button (second from the left on the upper bar) and then click it
		const openButton = await driver.findElement(By.xpath("//span[@aria-label = 'Menu Open']"));
		await openButton.click();

		//wait for the "open project" window to appear
		const openProjectTitleId = 'open-project-dialog-title';

		const openProjectWidget = await driver.wait(
			until.elementLocated(
				By.xpath(`//div[@role = 'dialog' and @aria-labelledby = '${openProjectTitleId}']`)
			),
			10_000
		);

		const openProjectTitle = await openProjectWidget.findElement(By.id(openProjectTitleId));
		await driver.wait(until.elementTextIs(openProjectTitle, 'Open Project'), 5_000);

		//find the "examples" button in the window and click it. (we find it by contained text as its id changes every time)
		const examplesButton = await openProjectWidget.findElement(
			By.xpath("//button[contains(text(),'Examples')]")
		);
		//check if the tab is not already selected
		expect(await examplesButton.getAttribute('aria-selected')).toBe('false');
		await examplesButton.click();

		//find the "examples" panel we just opened
		const examplesPanel = await driver.wait(
			until.elementLocated(
				By.xpath(
					`//div[@role = 'tabpanel' and @aria-labelledby = '${await examplesButton.getAttribute(
						'id'
					)}' and @id = '${await examplesButton.getAttribute('aria-controls')}']`
				)
			),
			10_000
		);

		//check if the tab is not hidden
		expect(await examplesPanel.getAttribute('hidden')).toBeFalsy();

		//find the list of examples
		const examplesList = await examplesPanel.findElement(By.id('Examples list'));

		//find the first option in the list
		//it has value=0 and is li element
		const firstExample = await examplesList.findElement(By.xpath("//li[@value = '0']"));

		//check if the first example is "Proton pencil beam in water"
		//text is located in element with id corresponding to aria-labelledby of the list element
		const exampleLabel = await openProjectWidget.findElement(
			By.id(await firstExample.getAttribute('aria-labelledby'))
		);
		expect(await exampleLabel.getText()).toBe('Proton pencil beam in water');

		//click the first example
		await firstExample.click();
		expect(await firstExample.getAttribute('aria-selected')).toEqual('true');

		//find the "load" button and click it
		const loadButton = await openProjectWidget.findElement(
			By.xpath("//button[@aria-label = 'Load example button']")
		);
		expect(await loadButton.isEnabled()).toEqual(true);
		await loadButton.click();

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

		//find the "Fluka" button and click it
		const flukaButton = await driver.findElement(By.xpath("//button[@value = 'fluka']"));
		await flukaButton.click();

		//accept the "current data will be lost" alert
		await driver.switchTo().alert().accept();

		//wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
		//xpath is used as again the id changes every time
		const generateButton = await driver.findElement(
			By.xpath("//button[contains(text(),'Generate from Editor')]")
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
