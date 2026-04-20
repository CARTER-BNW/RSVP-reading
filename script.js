let words = [];
let index = 0;
let running = false;
let timer = null;

let baseColor = "#ffffff";
let orpColor = "#ff4444";

const inputText = document.getElementById("inputText");
const leftPart = document.getElementById("leftPart");
const orpPart = document.getElementById("orpPart");
const rightPart = document.getElementById("rightPart");
const inlineContext = document.getElementById("inlineContext");

const wpmSlider = document.getElementById("wpmSlider");
const wpmInput = document.getElementById("wpmInput");
const sizeSlider = document.getElementById("sizeSlider");
const chunkSlider = document.getElementById("chunkSlider");

const toggleBig = document.getElementById("toggleBig");
const toggleInline = document.getElementById("toggleInline");

const progressBar = document.getElementById("progressBar");

function orpIndex(word) {
    return Math.floor((word.length - 1) / 2);
}

function prepareWords() {
    words = inputText.value.trim().split(/\s+/);
    index = 0;
    updateDisplay();
}

function play() {
    if (words.length === 0) prepareWords();
    if (words.length === 0) return;

    running = true;
    tick();
}

function pause() {
    running = false;
    clearTimeout(timer);
}

function restart() {
    pause();
    index = 0;
    updateDisplay();
    play();
}

function skip(seconds) {
    const wps = wpmSlider.value / 60;
    const delta = Math.round(seconds * wps);
    index = Math.max(0, Math.min(words.length - 1, index + delta));
    updateDisplay();
}

function tick() {
    if (!running) return;

    updateDisplay();

    index += Number(chunkSlider.value);
    if (index >= words.length) {
        running = false;
        return;
    }

    let interval = 60000 / wpmSlider.value;

    const word = words[index - 1];
    if (/[.!?]$/.test(word)) interval *= 1.8;
    else if (/[,;:]$/.test(word)) interval *= 1.4;

    timer = setTimeout(tick, interval);
}

function updateDisplay() {
    if (words.length === 0) return;

    const chunkSize = Number(chunkSlider.value);
    const chunk = words.slice(index, index + chunkSize);
    const firstWord = chunk[0] || "";

    const i = orpIndex(firstWord);

    leftPart.textContent = firstWord.slice(0, i);
    orpPart.textContent = firstWord[i] || "";
    rightPart.textContent = firstWord.slice(i + 1);

    leftPart.style.color = baseColor;
    rightPart.style.color = baseColor;
    orpPart.style.color = orpColor;

    document.getElementById("bigWord").style.fontSize = sizeSlider.value + "px";
    document.getElementById("bigWord").style.display = toggleBig.checked ? "block" : "none";

    if (toggleInline.checked) {
        const prev = words[index - 1] || "";
        const next = words[index + chunkSize] || "";
        inlineContext.textContent = `${prev}  [${chunk.join(" ")}]  ${next}`;
        inlineContext.style.display = "block";
    } else {
        inlineContext.style.display = "none";
    }

    progressBar.style.width = (index / words.length) * 100 + "%";
}

wpmSlider.oninput = () => {
    wpmInput.value = wpmSlider.value;
};

wpmInput.onchange = () => {
    let v = Number(wpmInput.value);
    v = Math.max(50, Math.min(2000, v));
    wpmSlider.value = v;
    wpmInput.value = v;
};

document.getElementById("playBtn").onclick = play;
document.getElementById("pauseBtn").onclick = pause;
document.getElementById("restartBtn").onclick = restart;
document.getElementById("backBtn").onclick = () => skip(-5);
document.getElementById("forwardBtn").onclick = () => skip(5);

document.getElementById("baseColorBtn").onclick = () => {
    const c = prompt("Enter text color (hex):", baseColor);
    if (c) baseColor = c;
};

document.getElementById("orpColorBtn").onclick = () => {
    const c = prompt("Enter ORP color (hex):", orpColor);
    if (c) orpColor = c;
};

document.getElementById("loadBtn").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = e => {
        const file = e.target.files[0];
        file.text().then(t => inputText.value = t);
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

document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : play();
    }
    if (e.code === "ArrowLeft") skip(-5);
    if (e.code === "ArrowRight") skip(5);
    if (e.key === "r") restart();
});
