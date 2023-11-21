const { ipcRenderer } = require('electron');

const averageButton = document.getElementById('get-average-btn');
const averageText = document.getElementById('average-text');
const bestAverageText = document.getElementById('bestAverage-text');
const worstAverageText = document.getElementById('worstAverage-text');
const funFactText = document.getElementById('funFact-text');
const logoBackground = document.getElementById('logoBackground');

document.addEventListener('DOMContentLoaded', () => {

    // Check if the color is already stored
    const storedColor = localStorage.getItem('appColor');

    if (storedColor) {
        averageButton.style.backgroundColor = storedColor;
        averageButton.style.boxShadow = storedColor;
        logoBackground.style.backgroundColor = storedColor;
    }
});


averageButton.addEventListener('click', async () => {

    // Update the average text
    const { globalAverage, bestAvg, bestAvgSubject, worstAvg, worstAvgSubject, randomSubject, newGlobalAverage } = await ipcRenderer.invoke('send-average');
    averageText.innerText = 'Your average is: ' + globalAverage + '\u{1F386}';
    bestAverageText.innerText = 'Best average: ' + bestAvg + ' in ' + bestAvgSubject + '\u{1F44F}';
    worstAverageText.innerText = 'Worst average: ' + worstAvg + ' in ' + worstAvgSubject + '\u{1F62D}';
    funFactText.innerText = 'Fun fact: If you had a 20 in ' + randomSubject + " you're average would be " + newGlobalAverage;
});