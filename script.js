//------------------------------------------------------------
// STATE
//------------------------------------------------------------
let words = [];
let index = 0;
let playing = false;
let timer = null;

let wpm = 300;
let wordSize = 48;

let baseColor = "#ffffff";
let orpColor = "#ff4444";

let showBig = true;
let showInline = true;


//------------------------------------------------------------
// ELEMENTS
//------------------------------------------------------------
const inputText = document.getElementById("inputText");

const leftPart = document.getElementById("leftPart");
const orpPart = document.getElementById("orpPart");
const rightPart = document.getElementById("rightPart");

const bigWordInner = document.getElementById("bigWordInner");
const bigWordContainer = document.getElementById("bigWordContainer");
const inlineContext = document.getElementById("inlineContext");

const progressBar = document.getElementById("progressBar");

// Controls
const mPlay = document.getElementById("mPlay");
const mPause = document.getElementById("mPause");
const mBack = document.getElementById("mBack");
const mForward = document.getElementById("mForward");
const mRestart = document.getElementById("mRestart");
const mSettings = document.getElementById("mSettings");

// Drawer
const settingsDrawer = document.getElementById("settingsDrawer");

const d_wpmSlider = document.getElementById("d_wpmSlider");
const d_wpmInput = document.getElementById("d_wpmInput");
const d_sizeSlider = document.getElementById("d_sizeSlider");

const d_toggleBig = document.getElementById("d_toggleBig");
const d_toggleInline = document.getElementById("d_toggleInline");

const d_baseColorBtn = document.getElementById("d_baseColorBtn");
const d_orpColorBtn = document.getElementById("d_orpColorBtn");


//------------------------------------------------------------
// LOAD / SAVE
//------------------------------------------------------------
document.getElementById("loadBtn").addEventListener("click", () => {
    inputText.value = localStorage.getItem("rsvp_text") || "";
    prepareWords();
});

document.getElementById("saveBtn").addEventListener("click", () => {
    localStorage.setItem("rsvp_text", inputText.value || "");
});


//------------------------------------------------------------
// WORD PREP
//------------------------------------------------------------
function prepareWords() {
    const text = inputText.value.trim();
    if (!text) {
        words = [];
        index = 0;
        updateDisplay();
        updateProgress();
        return;
    }

    words = text.replace(/\s+/g, " ").split(" ");
    index = 0;

    updateDisplay();
    updateProgress();
}


//------------------------------------------------------------
// ORP LOGIC
//------------------------------------------------------------
function getOrpIndex(word) {
    if (word.length <= 1) return 0;
    if (word.length <= 5) return 1;
    if (word.length <= 9) return 2;
    return 3;
}

function centerORP() {
    const containerRect = bigWordContainer.getBoundingClientRect();
    const orpRect = orpPart.getBoundingClientRect();

    const containerCenter = containerRect.left + containerRect.width / 2;
    const orpCenter = orpRect.left + orpRect.width / 2;

    const delta = containerCenter - orpCenter;

    const currentLeft = parseFloat(getComputedStyle(bigWordInner).left) || 0;
    bigWordInner.style.left = `${currentLeft + delta}px`;
}


//------------------------------------------------------------
// DISPLAY
//------------------------------------------------------------
function updateDisplay() {
    if (!words.length) {
        leftPart.textContent = "";
        orpPart.textContent = "";
        rightPart.textContent = "";
        inlineContext.textContent = "";
        return;
    }

    const word = words[index];
    const orpIdx = getOrpIndex(word);

    leftPart.textContent = word.slice(0, orpIdx);
    orpPart.textContent = word.charAt(orpIdx);
    rightPart.textContent = word.slice(orpIdx + 1);

    bigWordInner.style.fontSize = wordSize + "px";
    bigWordInner.style.color = baseColor;
    orpPart.style.color = orpColor;

    bigWordContainer.style.display = showBig ? "block" : "none";

    if (showInline) {
        const start = Math.max(0, index - 5);
        const end = Math.min(words.length, index + 6);
        inlineContext.textContent = words.slice(start, end).join(" ");
        inlineContext.style.display = "block";
    } else {
        inlineContext.style.display = "none";
    }

    bigWordInner.style.left = "0px";
    requestAnimationFrame(centerORP);
}


//------------------------------------------------------------
// PROGRESS
//------------------------------------------------------------
function updateProgress() {
    if (!words.length) {
        progressBar.style.width = "0%";
        return;
    }
    progressBar.style.width = (index / words.length) * 100 + "%";
}


//------------------------------------------------------------
// PLAYBACK
//------------------------------------------------------------
function getInterval() {
    return 60000 / wpm;
}

function tick() {
    if (!playing) return;

    index++;
    if (index >= words.length) {
        index = words.length - 1;
        stop();
        return;
    }

    updateDisplay();
    updateProgress();

    timer = setTimeout(tick, getInterval());
}

function play() {
    if (!words.length) prepareWords();
    if (!words.length) return;

    if (playing) return;
    playing = true;

    updateDisplay();
    updateProgress();

    timer = setTimeout(tick, getInterval());
}

function stop() {
    playing = false;
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}


//------------------------------------------------------------
// CONTROL BAR EVENTS
//------------------------------------------------------------
mPlay.addEventListener("click", play);
mPause.addEventListener("click", stop);

mRestart.addEventListener("click", () => {
    stop();
    index = 0;
    updateDisplay();
    updateProgress();
});

mBack.addEventListener("click", () => {
    const jump = Math.round((wpm / 60) * 5);
    index = Math.max(0, index - jump);
    updateDisplay();
    updateProgress();
});

mForward.addEventListener("click", () => {
    const jump = Math.round((wpm / 60) * 5);
    index = Math.min(words.length - 1, index + jump);
    updateDisplay();
    updateProgress();
});

mSettings.addEventListener("click", () => {
    settingsDrawer.classList.toggle("open");
});


//------------------------------------------------------------
// SETTINGS EVENTS
//------------------------------------------------------------
d_wpmSlider.addEventListener("input", () => {
    wpm = parseInt(d_wpmSlider.value, 10);
    d_wpmInput.value = wpm;
});

d_wpmInput.addEventListener("input", () => {
    wpm = parseInt(d_wpmInput.value, 10);
    d_wpmSlider.value = wpm;
});

d_sizeSlider.addEventListener("input", () => {
    wordSize = parseInt(d_sizeSlider.value, 10);
    updateDisplay();
});

d_toggleBig.addEventListener("change", () => {
    showBig = d_toggleBig.checked;
    updateDisplay();
});

d_toggleInline.addEventListener("change", () => {
    showInline = d_toggleInline.checked;
    updateDisplay();
});

d_baseColorBtn.addEventListener("click", () => {
    const c = prompt("Base text color:", baseColor);
    if (c) {
        baseColor = c;
        updateDisplay();
    }
});

d_orpColorBtn.addEventListener("click", () => {
    const c = prompt("ORP color:", orpColor);
    if (c) {
        orpColor = c;
        updateDisplay();
    }
});


//------------------------------------------------------------
// INIT
//------------------------------------------------------------
prepareWords();
updateDisplay();
updateProgress();
