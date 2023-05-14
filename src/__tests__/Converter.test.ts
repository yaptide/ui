import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { readFileSync } from 'fs';

describe('NavDrawer component', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().headless().addArguments("--window-size=1920,1080"))
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
    const openButton = await driver.findElement(By.xpath("//span[@aria-label = 'menu-Open']"));
    await openButton.click();
    
    //wait for the "open project" window to appear
    const openProjectWidget = await driver.wait(until.elementLocated(By.xpath("//div[@aria-label = 'openProjectDialog']")), 10000);

    //find the "examples" button in the window and click it. (we find it by contained text as its id changes every time)
    const examplesButton = await openProjectWidget.findElement(By.xpath("//button[contains(text(),'Examples')]"));
    await examplesButton.click();

    //find the first example option and click it
    const firstExample = await openProjectWidget.findElement(By.xpath("//div[contains(text(),'Proton pencil beam in water')]"));
    await firstExample.click();

    //find the "load" button and click it
    const loadButton = await openProjectWidget.findElement(By.xpath("//button[@aria-label = 'loadExampleButton']"));
    await loadButton.click();

    //accept the "current data will be lost" alert
    await driver.switchTo().alert().accept();

    //find the "Input Files" button on the left menu and click it to open the editor
    const filesButton = await driver.findElement(By.xpath("//div[@aria-label = 'Input files']"));
    await filesButton.click();

    //wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
    //xpath is used as again the id changes every time
    const generateButton = await driver.findElement(By.xpath("//button[contains(text(),'Generate from Editor')]"));
    await driver.wait(until.elementIsEnabled(generateButton), 15000);
    await generateButton.click();

    //wait until the text has appeared in the first text field
    await driver.wait(until.elementTextMatches(driver.findElement(By.xpath("//textarea[@aria-label = 'geo.datTextField']")), /\S/));

    //find all the text fields and check if they contain the correct text. characters other than text, numbers and dots are removed from the text before comparison
    //also check if expected text loaded from file is not empty
    const regex = /[^a-zA-Z0-9.]/g;

    const geoText = (await driver.findElement(By.xpath("//textarea[@aria-label = 'geo.datTextField']")).getText()).replace(regex, '');
    const expectedGeoText = readFileSync('src/libs/converter/input_examples/expected_shieldhit_output/geo.dat', 'utf-8').replace(regex, '');
    expect (expectedGeoText).not.toBe("");
    expect (geoText).toContain(expectedGeoText);

    const matText = (await driver.findElement(By.xpath("//textarea[@aria-label = 'mat.datTextField']")).getText()).replace(regex, '');
    const expectedMatText = readFileSync('src/libs/converter/input_examples/expected_shieldhit_output/mat.dat', 'utf-8').replace(regex, '');
    expect (expectedMatText).not.toBe("");
    expect (matText).toContain(expectedMatText);

    const beamText = (await driver.findElement(By.xpath("//textarea[@aria-label = 'beam.datTextField']")).getText()).replace(regex, '');
    const expectedBeamText = readFileSync('src/libs/converter/input_examples/expected_shieldhit_output/beam.dat', 'utf-8').replace(regex, '');
    expect (expectedBeamText).not.toBe("");
    expect (beamText).toContain(expectedBeamText);
    
    const detectText = (await driver.findElement(By.xpath("//textarea[@aria-label = 'detect.datTextField']")).getText()).replace(regex, '');
    const expectedDetectText = readFileSync('src/libs/converter/input_examples/expected_shieldhit_output/detect.dat', 'utf-8').replace(regex, '');
    expect (expectedDetectText).not.toBe("");
    expect (detectText).toContain(expectedDetectText);

  }, 50000);
});
