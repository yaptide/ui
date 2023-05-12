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
  test('converter generates correct files', async () => {
    await driver.get('http://localhost:3000');

    //find the "Editor" button on the left menu and click it to open the editor
    const editorButton = await driver.findElement(By.css("li.MuiListItem-root:nth-child(3)"));
    await editorButton.click();

    //find the "open" button (second from the left on the upper bar) and then click it
    const openButton = await driver.findElement(By.css("div.css-12z0wuy:nth-child(2) > span:nth-child(1)"));
    await openButton.click();
    
    //wait for the "open project" window to appear
    await driver.wait(until.elementLocated(By.css(".MuiPaper-elevation24")), 10000);

    //find the "examples" button in the window and click it. we need to check if xpath contains 'T-0', as the id of the button changes every time the window appears
    const examplesButton = await driver.findElement(By.xpath("// *[contains(@id,'T-0')]"));
    await examplesButton.click();

    //find the first example option and click it
    const firstExample = await driver.findElement(By.css("li.MuiListItem-root:nth-child(1) > div:nth-child(1)"));
    await firstExample.click();

    //find the "load" button and click it
    const loadButton = await driver.findElement(By.css(".MuiButton-contained"));
    await loadButton.click();

    //accept the "current data will be lost" alert
    driver.switchTo().alert().accept();

    await new Promise(resolve => setTimeout(resolve, 1500));

    //find the "Input Files" button on the left menu and click it to open the editor
    const filesButton = await driver.findElement(By.css("li.MuiListItem-root:nth-child(4)"));
    await filesButton.click();

    await new Promise(resolve => setTimeout(resolve, 7500));

    //wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
    //classname is used as again the id changes every time
    await driver.wait(until.elementLocated(By.className("MuiButtonBase-root MuiButton-root MuiLoadingButton-root MuiButton-contained MuiButton-containedInfo MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiLoadingButton-root MuiButton-contained MuiButton-containedInfo MuiButton-sizeMedium MuiButton-containedSizeMedium css-iqndx8-MuiButtonBase-root-MuiButton-root-MuiLoadingButton-root")), 20000);
    const generateButton = await driver.findElement(By.className("MuiButtonBase-root MuiButton-root MuiLoadingButton-root MuiButton-contained MuiButton-containedInfo MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiLoadingButton-root MuiButton-contained MuiButton-containedInfo MuiButton-sizeMedium MuiButton-containedSizeMedium css-iqndx8-MuiButtonBase-root-MuiButton-root-MuiLoadingButton-root"));
    await generateButton.click();
  
    //expect (await driver.getPageSource()).toContain("{'version': 'unknown', 'label': 'development', 'simulator': 'shieldhit'}");

    //find all the text fields and check if they contain the correct text
    const infoText = await driver.findElement(By.css('.MuiCardContent-root > div:nth-child(1) > div:nth-child(2) > textarea:nth-child(1)')).getText();
    expect (infoText).toContain("{'version': 'unknown', 'label': 'development', 'simulator': 'shieldhit'}");

  }, 30000);
});
