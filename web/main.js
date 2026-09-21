import { WebEngine } from "./engine/engine.js";

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const status = document.getElementById("status");

let currentFileName = "program.jp";

function setStatus(text) {
    if (status) {
        status.textContent = text;
    }
}

function createEngine() {
    return new WebEngine(output);
}

async function runProgram() {
    output.textContent = "";
    setStatus("実行中...");

    try {
        const engine = createEngine();

        await engine.run(
            editor.value
        );

        setStatus("実行完了");

    } catch (error) {
        const lines = [];

        lines.push("実行中にエラーが発生しました。");

        if (error?.lineNumber !== undefined) {
            lines.push(
                `行番号: ${error.lineNumber}`
            );
        }

        if (error?.message) {
            lines.push(
                `エラー: ${error.message}`
            );
        }

        if (error?.cause) {
            lines.push(
                `原因: ${error.cause}`
            );
        }

        if (error?.line) {
            lines.push(
                `コード: ${error.line}`
            );
        }

        if (lines.length === 1) {
            lines.push(
                `エラー: ${String(error)}`
            );
        }

        output.textContent = lines.join("\n");

        setStatus("実行エラー");
    }
}

function saveLocal() {
    localStorage.setItem(
        "japanese-language-code",
        editor.value
    );

    localStorage.setItem(
        "japanese-language-file",
        currentFileName
    );
}

function loadLocal() {
    const code = localStorage.getItem(
        "japanese-language-code"
    );

    const fileName = localStorage.getItem(
        "japanese-language-file"
    );

    if (code !== null) {
        editor.value = code;
    }

    if (fileName) {
        currentFileName = fileName;
    }
}

function clearEditor() {
    editor.value = "";
    output.textContent = "";
    setStatus("クリアしました");
    saveLocal();
}

function openFile() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".jp,text/plain";

    input.addEventListener("change", async () => {
        const file = input.files[0];

        if (!file) {
            return;
        }

        editor.value = await file.text();
        currentFileName = file.name;

        saveLocal();

        setStatus(
            `${file.name} を開きました`
        );
    });

    input.click();
}

function saveFile() {
    const blob = new Blob(
        [editor.value],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = currentFileName.endsWith(".jp")
        ? currentFileName
        : `${currentFileName}.jp`;

    a.click();

    URL.revokeObjectURL(url);

    saveLocal();

    setStatus(
        `${a.download} を保存しました`
    );
}

function saveAsFile() {
    const name = window.prompt(
        "ファイル名を入力してください",
        currentFileName
    );

    if (!name) {
        return;
    }

    currentFileName =
        name.endsWith(".jp")
            ? name
            : `${name}.jp`;

    saveFile();
}

document
    .getElementById("runButton")
    ?.addEventListener(
        "click",
        runProgram
    );

document
    .getElementById("clearButton")
    ?.addEventListener(
        "click",
        clearEditor
    );

document
    .getElementById("openButton")
    ?.addEventListener(
        "click",
        openFile
    );

document
    .getElementById("saveButton")
    ?.addEventListener(
        "click",
        saveFile
    );

document
    .getElementById("saveAsButton")
    ?.addEventListener(
        "click",
        saveAsFile
    );

editor?.addEventListener(
    "input",
    saveLocal
);

editor?.addEventListener(
    "keydown",
    event => {
        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {
            event.preventDefault();
            runProgram();
        }

        if (event.key === "Tab") {
            event.preventDefault();

            const start =
                editor.selectionStart;

            const end =
                editor.selectionEnd;

            editor.setRangeText(
                "    ",
                start,
                end,
                "end"
            );

            saveLocal();
        }
    }
);

loadLocal();

setStatus(
    "Japanese Language Web v2.1.0"
);