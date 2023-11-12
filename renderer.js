const { ipcRenderer } = require("electron");

const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const headlessSwitch = document.getElementById('switchHeadless');
const averageButton = document.getElementById("get-average-btn");
const averageText = document.getElementById("average-text");
const bestaAverageText = document.getElementById("bestAverage-text");
const eyeIcon = document.getElementById('eyeIcon');

averageButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    let switchValue;

    if (headlessSwitch.checked) {
        switchValue = 'new';
    } else {
        switchValue = false;
    }

    // Update the average text
    const result = await ipcRenderer.invoke("get-average");
    averageText.innerText = 'Your average is: ' + result;
    bestaAverageText.innerText = 'Best average: ' + bestaAvg;
});

eyeIcon.addEventListener('click', () => {
    if (passwordInput.type == "password") {
        passwordInput.type = "text";
        eyeIcon.src = "eye-open.png";
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "eye-close.png";
    }
});
