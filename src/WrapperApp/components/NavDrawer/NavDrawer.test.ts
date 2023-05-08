import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('NavDrawer component', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    jest.setTimeout(30000);
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().headless())
      .build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('renders a menu button', async () => {
    await driver.get('http://localhost:3000');
    const menuButton = await driver.findElement(By.css("button.MuiIconButton-root:nth-child(2)"));
    expect(await menuButton.isDisplayed()).toBeTruthy();
  });

  test('closes and opens the drawer on click', async () => {
    await driver.get('http://localhost:3000');
    const menuButton = await driver.findElement(By.css("button.MuiIconButton-root:nth-child(2)"));
    await menuButton.click();
    
    await driver.wait(until.elementLocated(By.className('MuiDrawer-root MuiDrawer-docked css-2dum1v-MuiDrawer-docked')), 1000);
    const closedDrawer = await driver.findElement(By.className('MuiDrawer-root MuiDrawer-docked css-2dum1v-MuiDrawer-docked'));
    expect(await closedDrawer.isDisplayed()).toBeTruthy();
    
    const menuButton2 = await driver.findElement(By.css("button.MuiIconButton-root:nth-child(2)"));
    await menuButton2.click();

    await driver.wait(until.elementLocated(By.className('MuiDrawer-root MuiDrawer-docked css-14if1t4-MuiDrawer-docked')), 1000);
    const openDrawer = await driver.findElement(By.className('MuiDrawer-root MuiDrawer-docked css-14if1t4-MuiDrawer-docked'));
    expect(await openDrawer.isDisplayed()).toBeTruthy();
  });
});
