import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('NavDrawer component', () => {
	let driver: WebDriver;

	beforeAll(async () => {
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(new chrome.Options().headless())
			.build();
	}, 30000);
	//test timeouts are set to 30000 ms, as default timeout of 5000 ms is not enough for the test to pass in github actions

	afterAll(async () => {
		await driver.quit();
	}, 30000);

	//this test checks if the menu button (upper left corner, next to the yaptide logo) has rendered
	test('renders a menu button', async () => {
		await driver.get('http://localhost:3000');
		const menuButton = await driver.findElement(
			By.xpath("//button[@aria-label = 'Toggle drawer button']")
		);
		expect(await menuButton.isDisplayed()).toBeTruthy();
	}, 30000);

	//this test check if the menu button works (closes and opens the menu drawer)
	test('closes and opens the drawer on click', async () => {
		await driver.get('http://localhost:3000');

		//find the menu button and then click it
		const menuButton = await driver.findElement(
			By.xpath("//button[@aria-label = 'Toggle drawer button']")
		);
		await menuButton.click();

		//check if the drawer has closed (by looking if the "closed drawer" component is rendered)
		await driver.wait(
			until.elementLocated(
				By.className('MuiDrawer-root MuiDrawer-docked css-2dum1v-MuiDrawer-docked')
			),
			1000
		);
		const closedDrawer = await driver.findElement(
			By.className('MuiDrawer-root MuiDrawer-docked css-2dum1v-MuiDrawer-docked')
		);
		expect(await closedDrawer.isDisplayed()).toBeTruthy();

		//find the menu button again and click it
		const menuButton2 = await driver.findElement(
			By.xpath("//button[@aria-label = 'Toggle drawer button']")
		);
		await menuButton2.click();

		//check if the drawer is open again
		await driver.wait(
			until.elementLocated(
				By.className('MuiDrawer-root MuiDrawer-docked css-14if1t4-MuiDrawer-docked')
			),
			1000
		);
		const openDrawer = await driver.findElement(
			By.className('MuiDrawer-root MuiDrawer-docked css-14if1t4-MuiDrawer-docked')
		);
		expect(await openDrawer.isDisplayed()).toBeTruthy();
	}, 30000);
});
