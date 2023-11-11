const { ipcRenderer } = require("electron");

const averageButton = document.getElementById("get-average-btn");
averageButton.addEventListener("click", (event) => {
    ipcRenderer.send("get-average-called");
});

const averageText = document.getElementById("average-text")
averageButton.addEventListener("click", async (event) => {
    const result = await ipcRenderer.invoke("get-average");
    averageText.innerText = 'Your average is: ' + result;
});