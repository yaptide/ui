import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

console.log('Starting benchmark...');

async function initBenchmark() {
	let driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(
			new chrome.Options().addArguments(
				'--window-size=1920,1080',
				'--headless'
			) as chrome.Options
		)
		.build();

	return driver;
}

async function benchmark(driver: WebDriver, numberOfPrimaryParticles = 1000) {
	await driver.get('http://localhost:3000');

	await driver.wait(
		until.elementLocated(
			By.xpath("//div[@aria-label = 'Navigation drawer for the YAPTIDE application']")
		),
		5_000
	);

	// Find and click the "Examples" button
	const examplesButton = await driver.findElement(By.xpath("//div[@aria-label = 'Examples']"));

	// Scroll into view to ensure the element is visible
	await driver.executeScript('arguments[0].scrollIntoView(true);', examplesButton);

	// Click the button
	await driver.wait(until.elementIsVisible(examplesButton), 5_000);
	await driver.wait(until.elementIsEnabled(examplesButton), 5_000);
	await examplesButton.click();

	// Wait until the "Examples" button is marked as active
	await driver.wait(
		until.elementLocated(
			By.xpath("//div[@aria-label = 'Examples' and @aria-selected = 'true']")
		),
		10_000
	);

	// Find the "GEANT4" section header
	const geant4SectionHeader = await driver.findElement(By.xpath("//h5[text()='GEANT4']"));

	// Scroll into view of the header
	await driver.executeScript('arguments[0].scrollIntoView(true);', geant4SectionHeader);

	// Ensure the section header is visible
	await geant4SectionHeader.isDisplayed();

	// Find the first example in the "GEANT4" section
	const firstExample = await driver.findElement(
		By.xpath(
			"//h5[text()='GEANT4']/following-sibling::div//div[contains(@class, 'MuiChip-root')][1]"
		)
	);

	// Scroll into view of the first example
	await driver.executeScript('arguments[0].scrollIntoView(true);', firstExample);

	// Ensure the first example is visible
	await firstExample.isDisplayed();

	// Click the first example
	await firstExample.click();

	// Check if the tab switched to "Editor"
	await driver.wait(
		until.elementLocated(By.xpath("//div[@aria-label = 'Editor' and @aria-selected = 'true']")),
		10_000
	);

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

	await driver.sleep(1000); // wait for modal to fade in

	await loadFileDialog.findElement(By.id(loadFileTitleId)).getText();

	await loadFileDialog.findElement(By.id(loadFileContentId)).getText();

	//check if the version warning is not present
	await loadFileDialog.findElements(By.id(versionWarningId));

	//find the "clear and proceed" button and click it
	const clearAndProceedButton = await loadFileDialog.findElement(
		By.xpath("//button[contains(text(),'Clear and proceed')]")
	);
	await clearAndProceedButton.isEnabled();
	await clearAndProceedButton.click();

	//find the "Simulations" button on the left menu and click it to open the editor
	const simulations = await driver.findElement(By.xpath("//div[@aria-label = 'Simulations']"));
	await simulations.click();

	await driver.wait(
		until.elementLocated(
			By.xpath("//div[@aria-label = 'Simulations' and @aria-selected = 'true']")
		),
		10_000
	);

	//set the number of primary particles
	const primaryParticlesInput = await driver.findElement(By.id('primary-particles-override'));
	await driver.wait(until.elementIsVisible(primaryParticlesInput), 5000);
	await primaryParticlesInput.click();

	await primaryParticlesInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
	await primaryParticlesInput.sendKeys(numberOfPrimaryParticles.toString());
	await primaryParticlesInput.sendKeys(Key.TAB);

	//wait until the "generate from editor" button and click it (it takes some time for the button to change from "initializing")
	//the ID is now defined in component and is used for element selection
	const downloadDatasets = await driver.findElement(
		By.id('start-geant4-dataset-download-button')
	);

	await driver.wait(until.elementIsEnabled(downloadDatasets), 15_000);
	await downloadDatasets.click();

	const startSimulationButton = await driver.findElement(By.id('start-simulation-button'));

	await driver.wait(until.elementIsEnabled(startSimulationButton));

	await startSimulationButton.click();

	await driver.wait(until.elementLocated(By.xpath("//span[normalize-space(.)='RUNNING']")));

	await driver.wait(
		until.elementLocated(By.xpath("//div[@aria-label = 'Results' and @aria-selected = 'true']"))
	);

	const simulations2 = await driver.findElement(By.xpath("//div[@aria-label = 'Simulations']"));
	await simulations2.click();

	await driver.wait(
		until.elementLocated(
			By.xpath("//div[@aria-label = 'Simulations' and @aria-selected = 'true']")
		),
		10_000
	);

	let durationText = await driver
		.findElement(By.xpath("//p[starts-with(normalize-space(.), 'Duration:')]"))
		.getText();

	durationText = durationText.replace('Duration: ', '');
	let durationSplit = durationText.split(':');
	const durationInSeconds =
		parseInt(durationSplit[0]) * 3600 +
		parseInt(durationSplit[1]) * 60 +
		parseFloat(durationSplit[2]);

	return durationInSeconds;
}

(async () => {
	let driver: WebDriver | null = null;

	try {
		driver = await initBenchmark();

		await benchmark(driver, 1000); // warmup

		let runs = 5;
		let primarities = [1000, 5000, 10000, 50000, 100000, 150000];

		console.log('n;t_s');

		for (const primaryParticles of primarities) {
			for (let i = 0; i < runs; i++) {
				const duration = await benchmark(driver, primaryParticles);
				console.log(`${primaryParticles};${duration}`);
			}
		}
	} catch (error) {
		console.error('Error during benchmark:', error);
	} finally {
		if (driver) {
			await driver.quit();
		}
	}
})();
