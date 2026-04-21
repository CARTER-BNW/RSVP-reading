// State
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

// Elements
const inputText = document.getElementById("inputText");
const progressBar = document.getElementById("progressBar");

const leftPart = document.getElementById("leftPart");
const orpPart = document.getElementById("orpPart");
const rightPart = document.getElementById("rightPart");
const bigWordInner = document.getElementById("bigWordInner");
const bigWordContainer = document.getElementById("bigWordContainer");
const inlineContext = document.getElementById("inlineContext");

// Controls
const mPlay = document.getElementById("mPlay");
const mPause = document.getElementById("mPause");
const mBack = document.getElementById("mBack");
const mForward = document.getElementById("mForward");
const mRestart = document.getElementById("mRestart");
const mSettings = document.getElementById("mSettings");

// Settings drawer
const settingsDrawer = document.getElementById("settingsDrawer");
const d_wpmSlider = document.getElementById("d_wpmSlider");
const d_wpmInput = document.getElementById("d_wpmInput");
const d_sizeSlider = document.getElementById("d_sizeSlider");
const d_toggleBig = document.getElementById("d_toggleBig");
const d_toggleInline = document.getElementById("d_toggleInline");
const d_baseColorBtn = document.getElementById("d_baseColorBtn");
const d_orpColorBtn = document.getElementById("d_orpColorBtn");

// Simple load/save using localStorage
document.getElementById("loadBtn").addEventListener("click", () => {
    const saved = localStorage.getItem("rsvp_text") || "";
    inputText.value = saved;
    prepareWords();
});

document.getElementById("saveBtn").addEventListener("click", () => {
    localStorage.setItem("rsvp_text", inputText.value || "");
});

// Prepare words from textarea
function prepareWords() {
    const text = inputText.value || "";
    words = text
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(w => w.length > 0);
    index = 0;
    updateDisplay();
    updateProgress();
}

// ORP index (rough heuristic)
function getOrpIndex(word) {
    if (word.length <= 1) return 0;
    if (word.length <= 5) return 1;
    if (word.length <= 9) return 2;
    return 3;
}

// Center ORP in container
function centerORP() {
    const containerWidth = bigWordContainer.clientWidth;
    const orpRect = orpPart.getBoundingClientRect();
    const containerRect = bigWordContainer.getBoundingClientRect();

    const orpCenter = orpRect.left + orpRect.width / 2;
    const containerCenter = containerRect.left + containerWidth / 2;
    const delta = containerCenter - orpCenter;

    const currentLeft = parseFloat(getComputedStyle(bigWordInner).left) || 0;
    bigWordInner.style.left = `${currentLeft + delta}px`;
}

// Show current word
function updateDisplay() {
    if (!words.length || index < 0 || index >= words.length) {
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

    document.getElementById("bigWordContainer").style.display = showBig ? "block" : "none";

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

// Progress
function updateProgress() {
    if (!words.length) {
        progressBar.style.width = "0%";
        return;
    }
    const pct = (index / words.length) * 100;
    progressBar.style.width = pct + "%";
}

// Timing
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

// Controls
mPlay.addEventListener("click", play);
mPause.addEventListener("click", stop);

mRestart.addEventListener("click", () => {
    stop();
    index = 0;
    updateDisplay();
    updateProgress();
});

mBack.addEventListener("click", () => {
    index = Math.max(0, index - Math.round((wpm / 60) * 5));
    updateDisplay();
    updateProgress();
});

mForward.addEventListener("click", () => {
    index = Math.min(words.length - 1, index + Math.round((wpm / 60) * 5));
    updateDisplay();
    updateProgress();
});

// Settings drawer toggle
mSettings.addEventListener("click", () => {
    settingsDrawer.classList.toggle("open");
});

// WPM sync
d_wpmSlider.addEventListener("input", () => {
    wpm = parseInt(d_wpmSlider.value, 10) || 300;
    d_wpmInput.value = wpm;
});

d_wpmInput.addEventListener("input", () => {
    wpm = parseInt(d_wpmInput.value, 10) || 300;
    d_wpmSlider.value = wpm;
});

// Size
d_sizeSlider.addEventListener("input", () => {
    wordSize = parseInt(d_sizeSlider.value, 10) || 48;
    updateDisplay();
});

// Toggles
d_toggleBig.addEventListener("change", () => {
    showBig = d_toggleBig.checked;
    updateDisplay();
});

d_toggleInline.addEventListener("change", () => {
    showInline = d_toggleInline.checked;
    updateDisplay();
});

// Colors (simple prompt-based for now)
d_baseColorBtn.addEventListener("click", () => {
    const c = prompt("Base text color (CSS value):", baseColor);
    if (c) {
        baseColor = c;
        updateDisplay();
    }
});

d_orpColorBtn.addEventListener("click", () => {
    const c = prompt("ORP color (CSS value):", orpColor);
    if (c) {
        orpColor = c;
        updateDisplay();
    }
});

// Init
prepareWords();
updateDisplay();
updateProgress();
