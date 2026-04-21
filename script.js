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
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const restartBtn = document.getElementById("restartBtn");

// Settings
const wpmSlider = document.getElementById("wpmSlider");
const wpmInput = document.getElementById("wpmInput");
const sizeSlider = document.getElementById("sizeSlider");

const toggleBig = document.getElementById("toggleBig");
const toggleInline = document.getElementById("toggleInline");

const baseColorBtn = document.getElementById("baseColorBtn");
const orpColorBtn = document.getElementById("orpColorBtn");

const loadBtn = document.getElementById("loadBtn");
const saveBtn = document.getElementById("saveBtn");


//------------------------------------------------------------
// LOAD / SAVE
//------------------------------------------------------------
loadBtn.addEventListener("click", () => {
    inputText.value = localStorage.getItem("rsvp_text") || "";
    prepareWords();
});

saveBtn.addEventListener("click", () => {
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
playBtn.addEventListener("click", play);
pauseBtn.addEventListener("click", stop);

restartBtn.addEventListener("click", () => {
    stop();
    index = 0;
    updateDisplay();
    updateProgress();
});

backBtn.addEventListener("click", () => {
    const jump = Math.round((wpm / 60) * 5);
    index = Math.max(0, index - jump);
    updateDisplay();
    updateProgress();
});

forwardBtn.addEventListener("click", () => {
    const jump = Math.round((wpm / 60) * 5);
    index = Math.min(words.length - 1, index + jump);
    updateDisplay();
    updateProgress();
});


//------------------------------------------------------------
// SETTINGS EVENTS
//------------------------------------------------------------
wpmSlider.addEventListener("input", () => {
    wpm = parseInt(wpmSlider.value, 10) || 300;
    wpmInput.value = wpm;
});

wpmInput.addEventListener("input", () => {
    wpm = parseInt(wpmInput.value, 10) || 300;
    wpmSlider.value = wpm;
});

sizeSlider.addEventListener("input", () => {
    wordSize = parseInt(sizeSlider.value, 10) || 48;
    updateDisplay();
});

toggleBig.addEventListener("change", () => {
    showBig = toggleBig.checked;
    updateDisplay();
});

toggleInline.addEventListener("change", () => {
    showInline = toggleInline.checked;
    updateDisplay();
});

baseColorBtn.addEventListener("click", () => {
    const c = prompt("Base text color:", baseColor);
    if (c) {
        baseColor = c;
        updateDisplay();
    }
});

orpColorBtn.addEventListener("click", () => {
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
