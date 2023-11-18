const { ipcRenderer } = require('electron');

const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const averageButton = document.getElementById('get-average-btn');
const averageText = document.getElementById('average-text');
const bestAverageText = document.getElementById('bestAverage-text');
const worstAverageText = document.getElementById('worstAverage-text');
const funFactText = document.getElementById('funFact-text');
const eyeIcon = document.getElementById('eyeIcon');


averageButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    ipcRenderer.send('get-average-called', { username, password });

    // Update the average text
    const { globalAverage, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject, randomSubject, newGlobalAverage } = await ipcRenderer.invoke('get-average');
    averageText.innerText = 'Your average is: ' + globalAverage + '\u{1F386}';
    bestAverageText.innerText = 'Best average: ' + bestAvg + ' in ' + bestAvgSubject + '\u{1F44F}';
    worstAverageText.innerText = 'Worst average: ' + worstAvg + ' in ' + worstAvgSubject + '\u{1F62D}';
    funFactText.innerText = 'Fun fact: If you had a 20 in ' + randomSubject + " you're average would be " + newGlobalAverage;
});

// Password visible or not
eyeIcon.addEventListener('click', () => {
    if (passwordInput.type == 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = 'C:/Users/Eleve/Documents/GitHub/Marks/graphics/eye-open.png';
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = 'C:/Users/Eleve/Documents/GitHub/Marks/graphics/eye-close.png';
    }
});
