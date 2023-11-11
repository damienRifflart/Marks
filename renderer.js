const { ipcRenderer } = require("electron");

const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const headlessSwitch = document.getElementById('switchHeadless');

const averageButton = document.getElementById("get-average-btn");
averageButton.addEventListener("click", (event) => {

    const username = usernameInput.value;
    const password = passwordInput.value;
    let switchValue;

    if (headlessSwitch.checked) {
        switchValue = 'new';
    } else {
        switchValue = false;
    }

    ipcRenderer.send("get-average-called", { username, password, headlessSwitch: switchValue });
});

const averageText = document.getElementById("average-text")
averageButton.addEventListener("click", async (event) => {
    const result = await ipcRenderer.invoke("get-average");
    averageText.innerText = 'Your average is: ' + result;

});

const eyeIcon = document.getElementById('eyeIcon');
eyeIcon.addEventListener('click', () => {
    if (passwordInput.type == "password"){
        passwordInput.type = "text";
        eyeIcon.src = "eye-open.png"
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "eye-close.png"
    }
})