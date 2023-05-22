import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('NavDrawer component', () => {
	let driver: WebDriver;

	beforeAll(async () => {
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(
				new chrome.Options().headless().addArguments('--window-size=1920,1080')
			)
			.build();
	}, 30000);
	//test timeouts are set to 30000 ms, as default timeout of 5000 ms is not enough for the test to pass in github actions

	afterAll(async () => {
		await driver.quit();
	}, 30000);

	//this test checks if converter works correctly - opens an example and generates config files
	test('converter generates correct files', async () => {
		await driver.get('http://localhost:3000');

		//find the "Editor" button on the left menu and click it to open the editor
		const editorButton = await driver.findElement(By.xpath("//div[@aria-label = 'Editor']"));
		await editorButton.click();

		//find the "open" button (second from the left on the upper bar) and then click it
		const openButton = await driver.findElement(By.xpath("//span[@aria-label = 'Menu Open']"));
		await openButton.click();

		//wait for the "open project" window to appear
		const openProjectWidget = await driver.wait(
			until.elementLocated(By.xpath("//div[@aria-label = 'Open project dialog']")),
			10000
		);

		//find the "examples" button in the window and click it. (we find it by contained text as its id changes every time)
		const examplesButton = await openProjectWidget.findElement(
			By.xpath("//button[contains(text(),'Examples')]")
		);
		await examplesButton.click();

		//find the list of examples
		const examplesList = await openProjectWidget.findElement(By.id('Examples list'));

		//find the first option in the list
		//it has value=0 and is li element
		const firstExample = await examplesList.findElement(By.xpath("//li[@value = '0']"));

		//check if the first example is "Proton pencil beam in water"
		//text is located in element with id corresponding to aria-labelledby of the list element
		const exampleLabelId = await firstExample.getAttribute('aria-labelledby');
		const exampleLabel = await openProjectWidget.findElement(By.id(exampleLabelId));
		expect(await exampleLabel.getText()).toBe('Proton pencil beam in water');

		//click the first example
		await firstExample.click();

		//find the "load" button and click it
		const loadButton = await openProjectWidget.findElement(
			By.xpath("//button[@aria-label = 'Load example button']")
		);
		await loadButton.click();

		//accept the "current data will be lost" alert
		await driver.switchTo().alert().accept();

		//find the "Input Files" button on the left menu and click it to open the editor
		const filesButton = await driver.findElement(
			By.xpath("//div[@aria-label = 'Input files']")
		);
		await filesButton.click();

		//find the "Topas" button and click it
		const topasButton = await driver.findElement(By.xpath("//button[@value = 'topas']"));
		await topasButton.click();

		//accept the "current data will be lost" alert
		await driver.switchTo().alert().accept();

		//wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
		//xpath is used as again the id changes every time
		const generateButton = await driver.findElement(
			By.xpath("//button[contains(text(),'Generate from Editor')]")
		);
		await driver.wait(until.elementIsEnabled(generateButton), 15000);
		await generateButton.click();

		//wait until the text has appeared in the first text field
		await driver.wait(
			until.elementTextMatches(
				driver.findElement(
					By.xpath("//textarea[@aria-label = 'topas_config.txt text field']")
				),
				/\S/
			)
		);

		//find the text field with config file and check if it is not empty

		const configText = await driver
			.findElement(By.xpath("//textarea[@aria-label = 'topas_config.txt text field']"))
			.getText();
		expect(configText).not.toBe('');
	}, 50000);
});
