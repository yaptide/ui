import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

describe('NavDrawer component', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      //.setChromeOptions(new chrome.Options().headless())
      .build();
  }, 30000);
  //test timeouts are set to 30000 ms, as default timeout of 5000 ms is not enough for the test to pass in github actions

  afterAll(async () => {
    await driver.quit();
  }, 30000);

  //this test checks if converter works correctly - opens an example and generates config files
  test('closes and opens the drawer on click', async () => {
    await driver.get('http://localhost:3000');

    //find the "Editor" button on the left menu and click it to open the editor
    const editorButton = await driver.findElement(By.xpath("/html/body/div/div/div[1]/div/ul[1]/li[1]/div"));
    await editorButton.click();

    //find the "open" button (second from the left on the upper bar) and then click it
    const openButton = await driver.findElement(By.xpath("/html/body/div/div/div[2]/div/div/div/header/div/div[2]/span"));
    await openButton.click();
    
    //wait for the "open project" window to appear
    await driver.wait(until.elementLocated(By.className("MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation24 MuiDialog-paper MuiDialog-paperScrollPaper MuiDialog-paperWidthSm css-1qxadfk-MuiPaper-root-MuiDialog-paper")), 10000);

    //find the "examples" button in the window and click it. we need to check if xpath contains 'T-0', as the id of the button changes every time the window appears
    const examplesButton = await driver.findElement(By.xpath("// *[contains(@id,'T-0')]"));
    await examplesButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 30000);
});
