const { ipcRenderer } = require("electron");

const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const headlessSwitch = document.getElementById('switchHeadless');
const averageButton = document.getElementById("get-average-btn");
const averageText = document.getElementById("average-text");
const eyeIcon = document.getElementById('eyeIcon');

// Restore credentials when the renderer process is loaded
ipcRenderer.on('restore-credentials', (event, { username, password }) => {
    usernameInput.value = username;
    passwordInput.value = password;
});

averageButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    let switchValue;

    if (headlessSwitch.checked) {
        switchValue = 'new';
    } else {
        switchValue = false;
    }

    // Save credentials when the "Get Average" button is clicked
    ipcRenderer.send('save-credentials', { username, password });

    // Wait for the credentials to be saved before proceeding
    await new Promise(resolve => setTimeout(resolve, 100));

    // Send credentials to the main process
    ipcRenderer.send("get-average-called", { username, password, headlessSwitch: switchValue });

    // Update the average text
    const result = await ipcRenderer.invoke("get-average");
    averageText.innerText = 'Your average is: ' + result;
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
