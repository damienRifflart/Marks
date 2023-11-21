const { ipcRenderer } = require('electron');

const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const eyeIcon = document.getElementById('eyeIcon');
const colorPicker = document.getElementById('colorPicker');
const logoBackground = document.getElementById('logoBackground');
const resetOptionsButton = document.getElementById('reset-options-btn');

const defaultAppColor = "#e74c3c";

document.addEventListener('DOMContentLoaded', () => {
    loadStoredCredentials();
});

window.addEventListener('beforeunload', saveCredentials);
eyeIcon.addEventListener('click', togglePasswordVisibility);
colorPicker.addEventListener('input', updateAppColor);
resetOptionsButton.addEventListener('click', resetOptions);

const storedColor = localStorage.getItem('appColor');
if (storedColor) {
    colorPicker.value = storedColor;
    updateColor(storedColor);
}

function loadStoredCredentials() {
    const storedPassword = localStorage.getItem('password');
    const storedUsername = localStorage.getItem('username');

    if (storedPassword) passwordInput.value = storedPassword;
    if (storedUsername) usernameInput.value = storedUsername;

    ipcRenderer.send('sending-credentials', { username: storedUsername, password: storedPassword });
}

function saveCredentials() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
}

function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.style.color = storedColor ? storedColor : '#e74c3c';
    } else {
        passwordInput.type = 'password';
        eyeIcon.style.color = '#f9f6f6';
    }
}

function updateAppColor(event) {
    const newColor = event.target.value;
    localStorage.setItem('appColor', newColor);
    updateColor(newColor);
}

function updateColor(newColor) {
    logoBackground.style.backgroundColor = newColor;
    passwordInput.style.outlineColor = newColor;
    usernameInput.style.outlineColor = newColor;
    resetOptionsButton.style.backgroundColor = newColor;
}

function resetOptions() {
    alert("All stored data will shortly be reset.")

    updateColor(defaultAppColor);
    colorPicker.value = defaultAppColor;
    usernameInput.value = ""
    passwordInput.value = ""

    localStorage.setItem('appColor', defaultAppColor);
}