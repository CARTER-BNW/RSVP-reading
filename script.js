/* ============================================================
   GLOBAL STATE
============================================================ */

let words = [];
let index = 0;
let running = false;
let timer = null;

let baseColor = "#ffffff";
let orpColor = "#ff4444";

/* ============================================================
   ELEMENT REFERENCES
============================================================ */

const inputText = document.getElementById("inputText");

const leftPart = document.getElementById("leftPart");
const orpPart = document.getElementById("orpPart");
const rightPart = document.getElementById("rightPart");
const bigWordInner = document.getElementById("bigWordInner");
const bigWordContainer = document.getElementById("bigWordContainer");

const inlineContext = document.getElementById("inlineContext");

const wpmSlider = document.getElementById("wpmSlider");
const wpmInput = document.getElementById("wpmInput");
const sizeSlider = document.getElementById("sizeSlider");
const chunkSlider = document.getElementById("chunkSlider");

const toggleBig = document.getElementById("toggleBig");
const toggleInline = document.getElementById("toggleInline");

const progressBar = document.getElementById("progressBar");

/* MOBILE CONTROLS */
const mPlay = document.getElementById("mPlay");
const mPause = document.getElementById("mPause");
const mBack = document.getElementById("mBack");
const mForward = document.getElementById("mForward");
const mRestart = document.getElementById("mRestart");
const mSettings = document.getElementById("mSettings");

/* SETTINGS DRAWER */
const drawer = document.getElementById("settingsDrawer");

const d_wpmSlider = document.getElementById("d_wpmSlider");
const d_wpmInput = document.getElementById("d_wpmInput");
const d_sizeSlider = document.getElementById("d_sizeSlider");
const d_chunkSlider = document.getElementById("d_chunkSlider");
const d_toggleBig = document.getElementById("d_toggleBig");
const d_toggleInline = document.getElementById("d_toggleInline");
const d_baseColorBtn = document.getElementById("d_baseColorBtn");
const d_orpColorBtn = document.getElementById("d_orpColorBtn");

/* ============================================================
   ORP INDEX
============================================================ */

function orpIndex(word) {
    return Math.floor((word.length - 1) / 2);
}

/* ============================================================
   PREPARE WORDS
============================================================ */

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

/* ============================================================
   PLAYBACK CONTROLS
============================================================ */

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

/* ============================================================
   TICK (WORD ADVANCE)
============================================================ */

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

/* ============================================================
   MAIN DISPLAY UPDATE
============================================================ */

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

    /* Colors */
    leftPart.style.color = baseColor;
    rightPart.style.color = baseColor;
    orpPart.style.color = orpColor;

    /* Font size */
    const size = sizeSlider.value + "px";
    leftPart.style.fontSize = size;
    orpPart.style.fontSize = size;
    rightPart.style.fontSize = size;

    /* Show/hide big word */
    bigWordContainer.style.display = toggleBig.checked ? "block" : "none";

    /* Pixel-perfect ORP centering */
    centerORP();

    /* Inline context */
    if (toggleInline.checked) {
        const prev = words[idx - 1] || "";
        const next = words[idx + chunkSize] || "";
        inlineContext.textContent = `${prev}  [${chunk.join(" ")}]  ${next}`;
        inlineContext.style.display = "block";
    } else {
        inlineContext.style.display = "none";
    }

    /* Progress */
    progressBar.style.width = (idx / words.length) * 100 + "%";
}

/* ============================================================
   ORP CENTERING ENGINE (DOUBLE RAF)
============================================================ */

function centerORP() {
    if (!toggleBig.checked) return;
    if (!orpPart.textContent) return;

    requestAnimationFrame(() => {
        const containerWidth = bigWordContainer.clientWidth;
        if (!containerWidth) return;

        const pivotWidth = orpPart.offsetWidth;
        const center = containerWidth / 2;

        // ORP is already at 50% with translate(-50%, -50%)

        // Left: right-aligned, ends at center - pivotWidth/2
        leftPart.style.left = (center - pivotWidth / 2) + "px";
        leftPart.style.transform = "translate(-100%, -50%)";

        // Right: left-aligned, starts at center + pivotWidth/2
        rightPart.style.left = (center + pivotWidth / 2) + "px";
        rightPart.style.transform = "translate(0, -50%)";
    });
}


/* ============================================================
   SYNC DESKTOP + MOBILE CONTROLS
============================================================ */

function syncToMobile() {
    d_wpmSlider.value = wpmSlider.value;
    d_wpmInput.value = wpmInput.value;
    d_sizeSlider.value = sizeSlider.value;
    d_chunkSlider.value = chunkSlider.value;
    d_toggleBig.checked = toggleBig.checked;
    d_toggleInline.checked = toggleInline.checked;
}

function syncToDesktop() {
    wpmSlider.value = d_wpmSlider.value;
    wpmInput.value = d_wpmInput.value;
    sizeSlider.value = d_sizeSlider.value;
    chunkSlider.value = d_chunkSlider.value;
    toggleBig.checked = d_toggleBig.checked;
    toggleInline.checked = d_toggleInline.checked;
    updateDisplay();
}

/* ============================================================
   SETTINGS DRAWER
============================================================ */

mSettings.onclick = () => {
    syncToMobile();
    drawer.classList.add("open");
};

drawer.onclick = (e) => {
    if (e.target === drawer) drawer.classList.remove("open");
};

/* Close drawer when tapping outside */
document.addEventListener("click", (e) => {
    if (!drawer.contains(e.target) && e.target !== mSettings) {
        drawer.classList.remove("open");
    }
});

/* Drawer controls update desktop controls */
d_wpmSlider.oninput = () => {
    d_wpmInput.value = d_wpmSlider.value;
    syncToDesktop();
};
d_wpmInput.onchange = () => {
    d_wpmSlider.value = d_wpmInput.value;
    syncToDesktop();
};

d_sizeSlider.oninput = () => {
    syncToDesktop();
};

d_chunkSlider.oninput = () => {
    syncToDesktop();
};

d_toggleBig.onchange = () => {
    syncToDesktop();
};

d_toggleInline.onchange = () => {
    syncToDesktop();
};

d_baseColorBtn.onclick = () => {
    const c = prompt("Enter text color:", baseColor);
    if (c) {
        baseColor = c;
        updateDisplay();
    }
};

d_orpColorBtn.onclick = () => {
    const c = prompt("Enter ORP color:", orpColor);
    if (c) {
        orpColor = c;
        updateDisplay();
    }
};

/* ============================================================
   DESKTOP CONTROLS
============================================================ */

wpmSlider.oninput = () => {
    wpmInput.value = wpmSlider.value;
    updateDisplay();
};

wpmInput.onchange = () => {
    let v = Number(wpmInput.value);
    if (isNaN(v)) v = 300;
    v = Math.max(50, Math.min(2000, v));
    wpmSlider.value = v;
    wpmInput.value = v;
    updateDisplay();
};

sizeSlider.oninput = updateDisplay;
chunkSlider.oninput = updateDisplay;
toggleBig.onchange = updateDisplay;
toggleInline.onchange = updateDisplay;

/* ============================================================
   BUTTONS
============================================================ */

document.getElementById("playBtn").onclick = play;
document.getElementById("pauseBtn").onclick = pause;
document.getElementById("restartBtn").onclick = restart;
document.getElementById("backBtn").onclick = () => skip(-5);
document.getElementById("forwardBtn").onclick = () => skip(5);

/* MOBILE BUTTONS */
mPlay.onclick = play;
mPause.onclick = pause;
mRestart.onclick = restart;
mBack.onclick = () => skip(-5);
mForward.onclick = () => skip(5);

/* ============================================================
   LOAD / SAVE TEXT
============================================================ */

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

document.getElementById("saveBtn").onclick = () => {
    const blob = new Blob([inputText.value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "text.txt";
    a.click();
};

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */

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

/* ============================================================
   RESIZE + ORIENTATION FIXES
============================================================ */

window.addEventListener("resize", centerORP);
window.addEventListener("orientationchange", centerORP);

/* ============================================================
   INITIAL RENDER
============================================================ */

updateDisplay();
