// State
let words = [];
let index = 0;
let running = false;
let timer = null;

let baseColor = "#ffffff";
let orpColor = "#ff4444";

// Elements
const inputText = document.getElementById("inputText");

const leftPart = document.getElementById("leftPart");
const orpPart = document.getElementById("orpPart");
const rightPart = document.getElementById("rightPart");
const bigWordContainer = document.getElementById("bigWordContainer");

const inlineContext = document.getElementById("inlineContext");

const wpmSlider = document.getElementById("wpmSlider");
const wpmInput = document.getElementById("wpmInput");
const sizeSlider = document.getElementById("sizeSlider");
const chunkSlider = document.getElementById("chunkSlider");

const toggleBig = document.getElementById("toggleBig");
const toggleInline = document.getElementById("toggleInline");

const progressBar = document.getElementById("progressBar");

// ORP index
function orpIndex(word) {
    return Math.floor((word.length - 1) / 2);
}

// Prepare words from textarea
function prepareWords() {
    const text = inputText.value.trim();
    if (!text) {
        words = [];
        index = 0;
        updateDisplay();
        return;
    }
    words = text.split(/\s+/);
    index = 0;
    updateDisplay();
}

// Playback controls
function play() {
    if (words.length === 0) prepareWords();
    if (words.length === 0) return;
    if (!running) {
        running = true;
        tick();
    }
}

function pause() {
    running = false;
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}

function restart() {
    pause();
    index = 0;
    updateDisplay();
    play();
}

function skip(seconds) {
    if (words.length === 0) prepareWords();
    if (words.length === 0) return;

    const wps = Number(wpmSlider.value) / 60;
    const delta = Math.round(seconds * wps);
    index = Math.max(0, Math.min(words.length - 1, index + delta));
    updateDisplay();
}

// Timing with punctuation slowdown
function tick() {
    if (!running) return;
    if (index >= words.length) {
        running = false;
        return;
    }

    updateDisplay();

    const chunkSize = Number(chunkSlider.value);
    index += chunkSize;
    if (index >= words.length) {
        index = words.length;
        updateDisplay();
        running = false;
        return;
    }

    let interval = 60000 / Number(wpmSlider.value);

    const prevIndex = index - chunkSize;
    if (prevIndex >= 0 && prevIndex < words.length) {
        const word = words[prevIndex];
        if (/[.!?]$/.test(word)) interval *= 1.8;
        else if (/[,;:]$/.test(word)) interval *= 1.4;
    }

    timer = setTimeout(tick, interval);
}

// Main display update
function updateDisplay() {
    if (words.length === 0) {
        leftPart.textContent = "";
        orpPart.textContent = "";
        rightPart.textContent = "";
        inlineContext.textContent = "";
        progressBar.style.width = "0%";
        return;
    }

    const chunkSize = Number(chunkSlider.value);
    const idx = Math.max(0, Math.min(index, words.length - 1));
    const chunk = words.slice(idx, idx + chunkSize);
    const firstWord = chunk[0] || "";

    const i = orpIndex(firstWord);
    const left = firstWord.slice(0, i);
    const pivot = firstWord[i] || "";
    const right = firstWord.slice(i + 1);

    leftPart.textContent = left;
    orpPart.textContent = pivot;
    rightPart.textContent = right;

    // Colors
    leftPart.style.color = baseColor;
    rightPart.style.color = baseColor;
    orpPart.style.color = orpColor;

    // Font size
    const size = sizeSlider.value + "px";
    leftPart.style.fontSize = size;
    orpPart.style.fontSize = size;
    rightPart.style.fontSize = size;

    // Show/hide big word
    bigWordContainer.style.display = toggleBig.checked ? "block" : "none";

    // Pixel-perfect centering of ORP
    if (toggleBig.checked && pivot) {
        // Force layout update
        const containerWidth = bigWordContainer.clientWidth;
        const centerX = containerWidth / 2;

        const pivotWidth = orpPart.offsetWidth;

        // ORP is already at 50% with translate(-50%, -50%)

        // Left: right-aligned, ends at centerX - pivotWidth/2
        leftPart.style.left = (centerX - pivotWidth / 2) + "px";
        leftPart.style.transform = "translate(-100%, -50%)";

        // Right: left-aligned, starts at centerX + pivotWidth/2
        rightPart.style.left = (centerX + pivotWidth / 2) + "px";
        rightPart.style.transform = "translate(0, -50%)";
    }

    // Inline context
    if (toggleInline.checked) {
        const prev = words[idx - 1] || "";
        const next = words[idx + chunkSize] || "";
        inlineContext.textContent = `${prev}  [${chunk.join(" ")}]  ${next}`;
        inlineContext.style.display = "block";
    } else {
        inlineContext.style.display = "none";
    }

    // Progress
    progressBar.style.width = (idx / words.length) * 100 + "%";
}

// WPM sync
wpmSlider.oninput = () => {
    wpmInput.value = wpmSlider.value;
};

wpmInput.onchange = () => {
    let v = Number(wpmInput.value);
    if (isNaN(v)) v = 300;
    v = Math.max(50, Math.min(2000, v));
    wpmSlider.value = v;
    wpmInput.value = v;
};

// Buttons
document.getElementById("playBtn").onclick = play;
document.getElementById("pauseBtn").onclick = pause;
document.getElementById("restartBtn").onclick = restart;
document.getElementById("backBtn").onclick = () => skip(-5);
document.getElementById("forwardBtn").onclick = () => skip(5);

// Color prompts
document.getElementById("baseColorBtn").onclick = () => {
    const c = prompt("Enter text color (CSS or hex):", baseColor);
    if (c) {
        baseColor = c;
        updateDisplay();
    }
};

document.getElementById("orpColorBtn").onclick = () => {
    const c = prompt("Enter ORP color (CSS or hex):", orpColor);
    if (c) {
        orpColor = c;
        updateDisplay();
    }
};

// Load text from file
document.getElementById("loadBtn").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        file.text().then(t => {
            inputText.value = t;
            words = [];
            index = 0;
            updateDisplay();
        });
    };
    input.click();
};

// Save text to file
document.getElementById("saveBtn").onclick = () => {
    const blob = new Blob([inputText.value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "text.txt";
    a.click();
};

// Toggles
toggleBig.onchange = () => updateDisplay();
toggleInline.onchange = () => updateDisplay();

// Keyboard shortcuts
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : play();
    } else if (e.code === "ArrowLeft") {
        skip(-5);
    } else if (e.code === "ArrowRight") {
        skip(5);
    } else if (e.key === "r" || e.key === "R") {
        restart();
    }
});

// Initial
updateDisplay();
