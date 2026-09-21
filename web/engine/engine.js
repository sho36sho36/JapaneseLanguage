import { JapaneseParser } from "./parser.js";
import { Runtime } from "./runtime.js";
import { PluginManager } from "./plugin.js";

import { DisplayPlugin } from "../plugins/display.js";
import { VariablePlugin } from "../plugins/variable.js";
import { InputPlugin } from "../plugins/input.js";
import { CalculatePlugin } from "../plugins/calculate.js";
import { WaitPlugin } from "../plugins/wait.js";
import { IncreasePlugin } from "../plugins/increase.js";
import { DecreasePlugin } from "../plugins/decrease.js";
import { MultiplyPlugin } from "../plugins/multiply.js";
import { DividePlugin } from "../plugins/divide.js";
import { RemainderPlugin } from "../plugins/remainder.js";
import { ToNumberPlugin } from "../plugins/to_number.js";
import { ToStringPlugin } from "../plugins/to_string.js";
import { ConcatPlugin } from "../plugins/concat.js";
import { UpperPlugin } from "../plugins/upper.js";
import { LowerPlugin } from "../plugins/lower.js";
import { MaximumPlugin } from "../plugins/maximum.js";
import { MinimumPlugin } from "../plugins/minimum.js";
import { AbsolutePlugin } from "../plugins/absolute.js";
import { RoundNumberPlugin } from "../plugins/round_number.js";
import { ExistsPlugin } from "../plugins/exists.js";
import { ListPlugin } from "../plugins/list.js";


export class WebLanguageError extends Error {

    constructor(
        message,
        lineNumber = null,
        cause = null
    ) {

        let text = "";

        if (lineNumber !== null) {
            text += `行番号: ${lineNumber}\n`;
        }

        text += `エラー: ${message}`;

        if (cause) {
            text += `\n原因: ${cause}`;
        }

        super(text);

        this.name = "JapaneseLanguageError";
        this.lineNumber = lineNumber;
        this.cause = cause;
    }
}


export class WebEngine {

    constructor(output = null) {

        this.version = "2.1.0";

        this.runtime = new Runtime(output);
        this.parser = new JapaneseParser();
        this.plugins = new PluginManager();

        this.registerPlugins();
    }


    registerPlugins() {

        this.plugins.register(new DisplayPlugin());
        this.plugins.register(new VariablePlugin());
        this.plugins.register(new InputPlugin());
        this.plugins.register(new CalculatePlugin());
        this.plugins.register(new WaitPlugin());

        this.plugins.register(new IncreasePlugin());
        this.plugins.register(new DecreasePlugin());
        this.plugins.register(new MultiplyPlugin());
        this.plugins.register(new DividePlugin());
        this.plugins.register(new RemainderPlugin());

        this.plugins.register(new ToNumberPlugin());
        this.plugins.register(new ToStringPlugin());
        this.plugins.register(new ConcatPlugin());
        this.plugins.register(new UpperPlugin());
        this.plugins.register(new LowerPlugin());

        this.plugins.register(new MaximumPlugin());
        this.plugins.register(new MinimumPlugin());
        this.plugins.register(new AbsolutePlugin());
        this.plugins.register(new RoundNumberPlugin());
        this.plugins.register(new ExistsPlugin());

        this.plugins.register(new ListPlugin());
    }


    getContext() {

        return {
            engine: this,
            runtime: this.runtime,
            parser: this.parser
        };
    }


    async run(code) {

        this.runtime.clear();

        const lines = code.split(/\r?\n/);

        // 実行前にブロック構造を検査
        this.validateBlocks(lines);

        await this.executeLines(
            lines,
            0,
            lines.length
        );

        return this.runtime.output;
    }


    async executeLines(lines, start, end) {

        const context = this.getContext();

        for (let i = start; i < end; i++) {

            const raw = lines[i];

            if (raw === undefined) {
                continue;
            }

            const line = raw.trim();

            if (!line) {
                continue;
            }

            if (line.startsWith("//")) {
                continue;
            }


            // ====================================================
            // 終わり
            // ====================================================

            if (line === "終わり") {

                return {
                    index: i,
                    type: "end"
                };
            }


            // ====================================================
            // それ以外
            // ====================================================

            if (line === "それ以外") {

                return {
                    index: i,
                    type: "else"
                };
            }


            // ====================================================
            // 抜ける
            // ====================================================

            if (line === "抜ける") {

                return {
                    index: i,
                    type: "break"
                };
            }


            // ====================================================
            // もし
            // ====================================================

            if (line.startsWith("もし ")) {

                const condition = line
                    .replace(/^もし\s*/, "");

                const block = this.findBlock(
                    lines,
                    i,
                    end
                );

                let result;

                try {

                    result = this.parser.evaluate(
                        condition,
                        this.runtime
                    );

                } catch (error) {

                    throw this.createLineError(
                        i + 1,
                        "条件式を評価できません。",
                        error.message
                    );
                }


                if (result) {

                    const innerResult =
                        await this.executeLines(
                            lines,
                            i + 1,
                            block.elseIndex >= 0
                                ? block.elseIndex
                                : block.endIndex
                        );

                    if (
                        innerResult &&
                        innerResult.type === "break"
                    ) {
                        return innerResult;
                    }

                } else if (block.elseIndex >= 0) {

                    const innerResult =
                        await this.executeLines(
                            lines,
                            block.elseIndex + 1,
                            block.endIndex
                        );

                    if (
                        innerResult &&
                        innerResult.type === "break"
                    ) {
                        return innerResult;
                    }
                }

                i = block.endIndex;

                continue;
            }


            // ====================================================
            // 繰り返す
            // ====================================================

            if (line.startsWith("繰り返す ")) {

                const expression = line
                    .replace(/^繰り返す\s*/, "")
                    .replace(/回$/, "")
                    .trim();

                let count;

                try {

                    count = this.parser.parseNumber(
                        expression,
                        this.runtime
                    );

                } catch (error) {

                    throw this.createLineError(
                        i + 1,
                        "繰り返し回数を数値として扱えません。",
                        error.message
                    );
                }

                if (!Number.isFinite(count)) {

                    throw this.createLineError(
                        i + 1,
                        "繰り返し回数を数値として扱えません。",
                        "「繰り返す」に指定する値は数値にしてください。"
                    );
                }

                count = Math.max(
                    0,
                    Math.floor(count)
                );

                const block = this.findBlock(
                    lines,
                    i,
                    end
                );

                for (let n = 0; n < count; n++) {

                    const result =
                        await this.executeLines(
                            lines,
                            i + 1,
                            block.endIndex
                        );

                    if (
                        result &&
                        result.type === "break"
                    ) {
                        break;
                    }
                }

                i = block.endIndex;

                continue;
            }


            // ====================================================
            // 通常命令
            // ====================================================

            try {

                const handled =
                    await this.plugins.execute(
                        line,
                        context
                    );

                if (!handled) {

                    throw this.createLineError(
                        i + 1,
                        "理解できない命令です。",
                        `「${line}」という命令は登録されていません。`
                    );
                }

            } catch (error) {

                if (
                    error instanceof WebLanguageError
                ) {
                    throw error;
                }

                throw this.createLineError(
                    i + 1,
                    "命令を実行できませんでした。",
                    error.message
                );
            }
        }

        return null;
    }


    // ============================================================
    // ブロック構造チェック
    // ============================================================

    validateBlocks(lines) {

        const stack = [];

        for (let i = 0; i < lines.length; i++) {

            const line = lines[i].trim();

            if (!line || line.startsWith("//")) {
                continue;
            }


            if (line.startsWith("もし ")) {

                stack.push({
                    type: "if",
                    line: i + 1,
                    hasElse: false
                });

                continue;
            }


            if (line.startsWith("繰り返す ")) {

                stack.push({
                    type: "loop",
                    line: i + 1,
                    hasElse: false
                });

                continue;
            }


            if (line === "それ以外") {

                if (stack.length === 0) {

                    throw this.createLineError(
                        i + 1,
                        "「それ以外」の対応する「もし」がありません。",
                        "「それ以外」は「もし」の中で使用してください。"
                    );
                }

                const current =
                    stack[stack.length - 1];

                if (current.type !== "if") {

                    throw this.createLineError(
                        i + 1,
                        "「それ以外」をここでは使用できません。",
                        "「それ以外」は「もし」の中で使用してください。"
                    );
                }

                if (current.hasElse) {

                    throw this.createLineError(
                        i + 1,
                        "「それ以外」を複数回使用しています。",
                        "1つの「もし」に対して「それ以外」は1回だけ使用できます。"
                    );
                }

                current.hasElse = true;

                continue;
            }


            if (line === "終わり") {

                if (stack.length === 0) {

                    throw this.createLineError(
                        i + 1,
                        "対応するブロックがありません。",
                        "この「終わり」に対応する「もし」または「繰り返す」がありません。"
                    );
                }

                stack.pop();

                continue;
            }
        }


        if (stack.length > 0) {

            const block =
                stack[stack.length - 1];

            const blockName =
                block.type === "if"
                    ? "もし"
                    : "繰り返す";

            throw this.createLineError(
                block.line,
                `「${blockName}」のブロックが閉じられていません。`,
                `この「${blockName}」に対応する「終わり」を追加してください。`
            );
        }
    }


    // ============================================================
    // ブロック検索
    // ============================================================

    findBlock(lines, start, end) {

        let depth = 0;
        let elseIndex = -1;

        for (let i = start; i < end; i++) {

            const line = lines[i].trim();

            if (
                line.startsWith("もし ") ||
                line.startsWith("繰り返す ")
            ) {

                depth++;

                continue;
            }


            if (line === "終わり") {

                depth--;

                if (depth === 0) {

                    return {
                        elseIndex,
                        endIndex: i
                    };
                }

                continue;
            }


            if (
                line === "それ以外" &&
                depth === 1
            ) {

                elseIndex = i;
            }
        }


        throw this.createLineError(
            start + 1,
            "ブロックを閉じられません。",
            "対応する「終わり」がありません。"
        );
    }


    // ============================================================
    // エラー生成
    // ============================================================

    createLineError(
        lineNumber,
        message,
        cause = null
    ) {

        return new WebLanguageError(
            message,
            lineNumber,
            cause
        );
    }
}