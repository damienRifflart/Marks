// Import Puppeteer
const puppeteer = require('puppeteer');

async function login(page) {
    // Login
    await page.waitForSelector('button#bouton_eleve', { visible: false });
    await page.click('button#bouton_eleve');
    await page.type('input#username', username);
    await page.type('input#password', password);
    await page.click('button#bouton_valider');

    // Wait for navigation after login
    await page.waitForNavigation();

    // Navigate to MBN
    await page.goto('https://cas.monbureaunumerique.fr/delegate/redirect/EDU');
    await page.waitForNavigation();

    await page.click('a[href="https://cas.monbureaunumerique.fr/login?service=https%3A%2F%2Flyc-armand.monbureaunumerique.fr%2Fsg.do%3FPROC%3DIDENTIFICATION_FRONT%26ACTION%3DVALIDER"]');

    // Get to the grades page
    await page.goto('https://lyc-armand.monbureaunumerique.fr/sg.do?PROC=CONSULTER_RELEVE&ACTION=AFFICHER_RELEVE_NOTES_ELEVE');
}

async function scrapeData(page) {
    // Get every values of divs with a specific class
    await page.waitForSelector('.yui-dt-liner.bulletin-note.bulletin-note-eleve');
    const elements = await page.$$('.yui-dt-liner.bulletin-note.bulletin-note-eleve');
    
    const values = await Promise.all(
        // Converts the values to int but replacing the comma with a point
        elements.map(el => page.evaluate(el => parseFloat(el.textContent.trim().replace(',', '.')), el))
    );
    
    // The reduce function split all values, it takes 2 arguments, acc (accumulator, current sum), and value (the current value that's being processed) and adds them.
    let sum = values.reduce((acc, value) => acc + value, 0);
    
    // Calculate the average and truncate to 2 numbers after the comma
    let average = Math.floor((sum / values.length) * 100) / 100;
    
    return average
}

async function getAverage(url, arg1) {
    try {
        const browser = await puppeteer.launch({ headless: switchValue });
        const page = await browser.newPage();
        await page.goto(url);

        // Call login function
        await login(page);

        // Call scrapeData function
        let average = await scrapeData(page);

        // Close the browser
        await browser.close();

        return average
      
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { electron } = require('process');
const {ipcMain} = require('electron');

const createWindow = () => {
  win = new BrowserWindow({
      width: 800,
      height: 450,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },

      // TODO: Create and add an icon
      icon: path.join(__dirname, 'logo.png'),
    });

    ipcMain.on('get-average-called', (event, data) => {
      username = data.username
      password = data.password
      switchValue = data.headlessSwitch 
    
    });

    win.loadFile('index.html')

}

function sendAverage() {
  return getAverage('https://educonnect.education.gouv.fr/idp/profile/SAML2/POST/SSO?execution=e3s1')
}

ipcMain.handle("get-average", sendAverage);

app.whenReady().then(() => {
  createWindow()

}).catch((error) => {
  console.error(error);
});