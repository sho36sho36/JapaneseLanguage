export class Runtime {
    constructor(outputElement = null) {
        this.variables = {};
        this.outputElement = outputElement;
        this.output = [];
    }

    // ========================================
    // 変数
    // ========================================

    set(name, value) {
        this.variables[name] = value;
    }

    get(name) {
        if (!this.exists(name)) {
            throw new Error(
                `変数「${name}」が存在しません。`
            );
        }

        return this.variables[name];
    }

    exists(name) {
        return Object.prototype.hasOwnProperty.call(
            this.variables,
            name
        );
    }

    names() {
        return Object.keys(this.variables);
    }

    clearVariables() {
        this.variables = {};
    }

    // ========================================
    // 出力
    // ========================================

    write(value) {
        const text = String(value);

        this.output.push(text);

        if (this.outputElement) {
            this.outputElement.textContent +=
                text + "\n";
        }
    }

    clearOutput() {
        this.output = [];

        if (this.outputElement) {
            this.outputElement.textContent = "";
        }
    }

    // ========================================
    // Runtime全体をリセット
    // ========================================

    clear() {
        this.clearVariables();
        this.clearOutput();
    }
}