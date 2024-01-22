const { ipcRenderer } = require('electron');

const averageButton = document.getElementById('get-average-btn');
const averageText = document.getElementById('average-text');
const bestAverageText = document.getElementById('bestAverage-text');
const worstAverageText = document.getElementById('worstAverage-text');
const funFactText = document.getElementById('funFact-text');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

averageButton.addEventListener('click', async () => {

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    
    ipcRenderer.send('credentials', { username: usernameInput, password: passwordInput });    

    // Update the average text
    const { globalAverage, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject, randomSubject, newGlobalAverage } = await ipcRenderer.invoke('send-average');
    averageText.innerText = 'Your average is: ' + globalAverage + '\u{1F386}';
    bestAverageText.innerText = 'Best average: ' + bestAvg + ' in ' + bestAvgSubject + '\u{1F44F}';
    worstAverageText.innerText = 'Worst average: ' + worstAvg + ' in ' + worstAvgSubject + '\u{1F62D}';
    funFactText.innerText = 'Fun fact: If you had a 20 in ' + randomSubject + " you're average would be " + newGlobalAverage;
});

loadStoredData();
window.addEventListener('beforeunload', saveCredentials);

function loadStoredData() {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (storedUsername) usernameInput.value = storedUsername;
    if (storedPassword) passwordInput.value = storedPassword;
};

function saveCredentials() {
    localStorage.setItem('username', usernameInput.value);
    localStorage.setItem('password', passwordInput.value);
};