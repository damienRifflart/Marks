const { ipcRenderer } = require('electron');

const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const headlessSwitch = document.getElementById('switchHeadless');
const averageButton = document.getElementById('get-average-btn');
const averageText = document.getElementById('average-text');
const bestAverageText = document.getElementById('bestAverage-text');
const worstAverageText = document.getElementById('worstAverage-text');
const funFactText = document.getElementById('funFact-text');
const eyeIcon = document.getElementById('eyeIcon');
const assignmentTitleText = document.getElementById("assignment-title");
const assignmentDescriptionText = document.getElementById('assignment-description');


averageButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    let switchValue;

    if (headlessSwitch.checked) {
        switchValue = 'new';
    } else {
        switchValue = false;
    }

    ipcRenderer.send('get-average-called', { username, password, headlessSwitch: switchValue });

    // Update the average text
    const { globalAverage, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject, randomSubject, newGlobalAverage, assignmentSubject, assignmentDescription } = await ipcRenderer.invoke('get-average');
    averageText.innerText = 'Your average is: ' + globalAverage + '\u{1F386}';
    bestAverageText.innerText = 'Best average: ' + bestAvg + ' in ' + bestAvgSubject + '\u{1F44F}';
    worstAverageText.innerText = 'Worst average: ' + worstAvg + ' in ' + worstAvgSubject + '\u{1F62D}';
    funFactText.innerText = 'Fun fact: If you had a 20 in ' + randomSubject + " you're average would be " + newGlobalAverage;
    assignmentTitleText.innerText = assignmentSubject[0];
    assignmentDescriptionText.innerText = assignmentDescription[0];
});

// Password visible or not
eyeIcon.addEventListener('click', () => {
    if (passwordInput.type == 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = '/graphics/eye-open.png/';
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = '/graphics/eye-close.png/';
    }
});