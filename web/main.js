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
        output.textContent =
            error?.message || String(error);

        setStatus("実行エラー");
    }
}

function saveLocal() {
    localStorage.setItem(
        "japanese-language-code",
        editor.value
    );

    localStorage.setItem(
        "japanese-language-file-name",
        currentFileName
    );

    setStatus("ローカル保存しました");
}

function loadLocal() {
    const savedCode = localStorage.getItem(
        "japanese-language-code"
    );

    const savedFileName = localStorage.getItem(
        "japanese-language-file-name"
    );

    if (savedCode !== null) {
        editor.value = savedCode;
    }

    if (savedFileName !== null) {
        currentFileName = savedFileName;
    }
}

function clearEditor() {
    editor.value = "";
    output.textContent = "";

    currentFileName = "program.jp";

    setStatus("クリアしました");
}

function openFile() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".jp,text/plain";

    input.addEventListener("change", () => {
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            editor.value = String(
                reader.result ?? ""
            );

            currentFileName = file.name;

            saveLocal();

            setStatus(
                `${file.name} を開きました`
            );
        };

        reader.onerror = () => {
            setStatus("ファイルを読み込めませんでした");
        };

        reader.readAsText(
            file,
            "UTF-8"
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

    const link = document.createElement("a");

    link.href = url;
    link.download = currentFileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    saveLocal();

    setStatus(
        `${currentFileName} を保存しました`
    );
}

function saveAsFile() {
    const name = window.prompt(
        "ファイル名を入力してください",
        currentFileName
    );

    if (name === null) {
        return;
    }

    let fileName = name.trim();

    if (!fileName) {
        fileName = "program";
    }

    if (!fileName.toLowerCase().endsWith(".jp")) {
        fileName += ".jp";
    }

    currentFileName = fileName;

    saveFile();
}

function setupButtons() {
    const openButton =
        document.getElementById("openButton");

    const saveButton =
        document.getElementById("saveButton");

    const saveAsButton =
        document.getElementById("saveAsButton");

    const runButton =
        document.getElementById("runButton");

    const clearButton =
        document.getElementById("clearButton");

    if (openButton) {
        openButton.addEventListener(
            "click",
            openFile
        );
    }

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            saveFile
        );
    }

    if (saveAsButton) {
        saveAsButton.addEventListener(
            "click",
            saveAsFile
        );
    }

    if (runButton) {
        runButton.addEventListener(
            "click",
            runProgram
        );
    }

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearEditor
        );
    }
}

function setupEditor() {
    if (!editor) {
        return;
    }

    editor.addEventListener(
        "keydown",
        (event) => {
            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {
                event.preventDefault();

                runProgram();

                return;
            }

            if (event.key === "Tab") {
                event.preventDefault();

                const start =
                    editor.selectionStart;

                const end =
                    editor.selectionEnd;

                const value =
                    editor.value;

                editor.value =
                    value.substring(
                        0,
                        start
                    ) +
                    "    " +
                    value.substring(
                        end
                    );

                editor.selectionStart =
                    start + 4;

                editor.selectionEnd =
                    start + 4;
            }
        }
    );
}

loadLocal();

setupButtons();

setupEditor();

setStatus(
    "Japanese Language Web v2.1.1"
);