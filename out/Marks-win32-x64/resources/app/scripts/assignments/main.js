const logoBackground = document.getElementById('logoBackground');
const assignmentsButton = document.getElementById('get-assignments-btn');

document.addEventListener('DOMContentLoaded', () => {

    // Check if the color is already stored
    const storedColor = localStorage.getItem('appColor');

    if (storedColor) {
        logoBackground.style.backgroundColor = storedColor;
        assignmentsButton.style.backgroundColor = storedColor;
    }
});