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

    // Get to the grades page
    await page.goto('https://lyc-armand.monbureaunumerique.fr/sg.do?PROC=CONSULTER_RELEVE&ACTION=AFFICHER_RELEVE_NOTES_ELEVE');
}

async function scrapeData(page) {
  await page.waitForSelector('.yui-dt-liner.bulletin-note.bulletin-note-eleve');
  await page.waitForSelector('.bulletin-matiere-libelle.ellipse.fw-700');
  await page.waitForSelector('.note-releve.txt-center');

  const rawGrades = await page.$$('.yui-dt-liner.bulletin-note.bulletin-note-eleve');
  const rawSubjects = await page.$$('.bulletin-matiere-libelle.ellipse.fw-700');
  const rawMarks = await page.$$('.note-releve.txt-center');

  const grades = await Promise.all(
      rawGrades.map(el => page.evaluate(el => parseFloat(el.textContent.trim().replace(',', '.')), el))
  );

  const subjects = await Promise.all(rawSubjects.map(async (el) => {
      return await page.evaluate((el) => el.textContent.trim(), el);
  }));

  const marks = await Promise.all(rawMarks.map(async (el) => {
    return await page.evaluate((el) => el.textContent.trim(), el);
  }));

  // Il faut compter combien il y a divs dans le div avec les notes, puis comme j'ai déjà codé la parti qui récupère les notes,
  // il faudra ensuite trouver un moyen de récupérer les notes de chaques sujets

  let bestAvg = Math.max(...grades);
  let worstAvg = Math.min(...grades);

  // Get the index of the best avg and the worst avg
  let bestAvgIndex = String(grades.indexOf(bestAvg));
  let worstAvgIndex = String(grades.indexOf(worstAvg));

  // Use this index to find the corresponding subjet
  // chartAt(0) takes the 1st letter
  let bestAvgSubject = subjects[bestAvgIndex].charAt(0).toUpperCase() + subjects[bestAvgIndex].slice(1).toLowerCase();
  let worstAvgSubject = subjects[worstAvgIndex].charAt(0).toUpperCase() + subjects[worstAvgIndex].slice(1).toLowerCase();

  var randomIndex = Math.floor(Math.random() * subjects.length);
  randomSubject = subjects[randomIndex]

  let sum = grades.reduce((acc, grade) => acc + grade, 0);
  let average = Math.floor((sum / grades.length) * 100) / 100;

  return {
      average,
      bestAvg,
      bestAvgSubject,
      worstAvg,
      worstAvgSubject,
      randomSubject
  };
}

async function getAverage(url) {
    try {
        const browser = await puppeteer.launch({ headless: switchValue });
        const page = await browser.newPage();
        await page.goto(url);

        // Call login function
        await login(page);

        await page.waitForTimeout(100);;

        // Call scrapeData function
        let { average, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject } = await scrapeData(page);

        // Close the browser
        await browser.close();

        return {
          average,
          bestAvg,
          bestAvgSubject,
          worstAvg,
          worstAvgSubject
        };
      
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

    // Get data from renderer.js
    ipcMain.on('get-average-called', (event, data) => {
      username = data.username
      password = data.password
      switchValue = data.headlessSwitch
    });

    win.loadFile('index.html')
}

function sendAverage() {
  return getAverage('https://cas.monbureaunumerique.fr/delegate/redirect/EDU')
}

// Send data to renderer.js
ipcMain.handle("get-average", sendAverage);

app.whenReady().then(() => {
  createWindow()

}).catch((error) => {
  console.error(error);
});