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

async function scrapeGrades(page) {

  // Get all averages
  await page.waitForSelector('.yui-dt-liner.bulletin-note.bulletin-note-eleve');
  const rawAverages = await page.$$('.yui-dt-liner.bulletin-note.bulletin-note-eleve');

  const averages = await Promise.all(
    rawAverages.map(el => page.evaluate(el => parseFloat(el.textContent.trim().replace(',', '.')), el))
  );

  // Get the global average
  let sumAverages = averages.reduce((acc, averages) => acc + averages, 0);
  let globalAverage = Math.floor((sumAverages / averages.length) * 100) / 100;

  // Get all subjects names
  await page.waitForSelector('.bulletin-matiere-libelle.ellipse.fw-700');
  const rawSubjects = await page.$$('.bulletin-matiere-libelle.ellipse.fw-700');

  const subjects = await Promise.all(rawSubjects.map(async (el) => {
    return await page.evaluate((el) => el.textContent.trim(), el);
  }));

  // Choose a random index
  let randomIndex = await Math.floor(Math.random() * subjects.length);

  // Get best/worst average
  let bestAvg = Math.max(...averages);
  let worstAvg = Math.min(...averages);

  // Get the index of the best avg and the worst avg
  let bestAvgIndex = String(averages.indexOf(bestAvg));
  let worstAvgIndex = String(averages.indexOf(worstAvg));

  // Use this index to find the corresponding subjet
  // chartAt(0) takes the 1st letter
  let bestAvgSubject = subjects[bestAvgIndex].charAt(0).toUpperCase() + subjects[bestAvgIndex].slice(1).toLowerCase();
  let worstAvgSubject = subjects[worstAvgIndex].charAt(0).toUpperCase() + subjects[worstAvgIndex].slice(1).toLowerCase();

  // Get a random subject
  let randomSubject = subjects[randomIndex].charAt(0).toUpperCase() + subjects[randomIndex].slice(1).toLowerCase();

  // Get every grades of one subject
  await page.waitForSelector(`#yui-rec${randomIndex} .yui-dt0-col-notesEleve .yui-dt-liner .list-devoirs-eleve .bloc-note-releve.d-inbl .note-releve`);
  const rawGradesPerSubject = await page.$$(`#yui-rec${randomIndex} .yui-dt0-col-notesEleve .yui-dt-liner .list-devoirs-eleve .bloc-note-releve.d-inbl .note-releve`);

  const gradesPerSubject = await Promise.all(
    rawGradesPerSubject.map(el => page.evaluate(el => parseFloat(el.textContent.trim().replace(',', '.')), el))
  );

  // Find the subject average
  let sumGrades = gradesPerSubject.reduce((acc, gradesPerSubject) => acc + gradesPerSubject, 0);

  // Simulate a 20 and find out the new average + the new global average
  let averagePerSubject = Math.floor(((sumGrades + 20) / (gradesPerSubject.length + 1)) * 100) / 100;
  let newGlobalAverage = Math.floor((sumAverages - averages[randomIndex] + averagePerSubject) / averages.length * 100) / 100;


  return {
      globalAverage,
      bestAvg,
      bestAvgSubject,
      worstAvg,
      worstAvgSubject,
      randomSubject,
      newGlobalAverage,
  };
}

async function scrapeAssignments(page) {

  page.goto('https://lyc-armand.monbureaunumerique.fr/sg.do?PROC=TRAVAIL_A_FAIRE&ACTION=AFFICHER_ELEVES_TAF&filtreAVenir=true&nonFait=true');

  await page.waitForNavigation();
  
  const rawAssignmentSubject = await page.$$('.p-like.b-like.slug.slug--xs');
  const rawAssignmentDescription = await page.$$('.panel.panel--full.panel--no-margin');
  
  const assignmentSubject = await Promise.all(
    rawAssignmentSubject.map(async (el) => {
        const textContent = await page.evaluate(el => el.textContent.trim(), el);
        const subjectName = textContent.split(/\s+/)[0]; // [0] gets the first part of the text
        return subjectName.charAt(0).toUpperCase() + subjectName.slice(1).toLowerCase();;
    })
  );

  const assignmentDescription = await Promise.all(rawAssignmentDescription.map(async (el) => {
    return page.evaluate((el) => el.textContent.trim(), el);
  }));

  return {
    assignmentSubject,
    assignmentDescription
  }

}

async function getAverage(url) {
    try {
        const browser = await puppeteer.launch({ headless: switchValue });
        const page = await browser.newPage();
        await page.goto(url);

        // Call login function
        await login(page);

        await page.waitForTimeout(100);;

        // Call scrapeGrades function
        let { globalAverage, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject, randomSubject, newGlobalAverage } = await scrapeGrades(page);
        
        await page.waitForTimeout(100);;

        // Call scrapeAssignments function
        await scrapeAssignments(page);
         let { assignmentSubject, assignmentDescription } = await scrapeAssignments(page);

        // Close the browser
        await browser.close();

        return {
          globalAverage,
          bestAvg,
          bestAvgSubject,
          worstAvg,
          worstAvgSubject,
          randomSubject,
          newGlobalAverage,
          assignmentSubject,
          assignmentDescription
          // dueDate
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

    win.loadFile('./scripts/index.html/')
}

function sendAverage() {
  return getAverage('https://cas.monbureaunumerique.fr/delegate/redirect/EDU')
}

// Send data to renderer.js
ipcMain.handle('get-average', sendAverage);

app.whenReady().then(() => {
  createWindow()

}).catch((error) => {
  console.error(error);
});