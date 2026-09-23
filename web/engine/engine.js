import { JapaneseParser } from "./parser.js";
import { Runtime } from "./runtime.js";
import { PluginManager } from "./plugin.js";
import { PackageManager } from "../package/manager.js";

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

import { AveragePlugin } from "../plugins/average.js";
import { SumPlugin } from "../plugins/sum.js";
import { RangePlugin } from "../plugins/range.js";

import { EvenPlugin } from "../plugins/even.js";
import { OddPlugin } from "../plugins/odd.js";
import { PositivePlugin } from "../plugins/positive.js";
import { NegativePlugin } from "../plugins/negative.js";
import { ZeroPlugin } from "../plugins/zero.js";

import { StringLengthPlugin } from "../plugins/string_length.js";
import { StringFindPlugin } from "../plugins/string_find.js";
import { StringReplacePlugin } from "../plugins/string_replace.js";
import { StringSlicePlugin } from "../plugins/string_slice.js";
import { StripPlugin } from "../plugins/strip.js";
import { ContainsPlugin } from "../plugins/contains.js";

import { SqrtPlugin } from "../plugins/sqrt.js";
import { PowerPlugin } from "../plugins/power.js";
import { FloorPlugin } from "../plugins/floor.js";
import { CeilPlugin } from "../plugins/ceil.js";
import { RandomPlugin } from "../plugins/random.js";

import { GcdPlugin } from "../plugins/gcd.js";
import { LcmPlugin } from "../plugins/lcm.js";
import { PrimePlugin } from "../plugins/prime.js";
import { FactorialPlugin } from "../plugins/factorial.js";
import { SignPlugin } from "../plugins/sign.js";
import { NegatePlugin } from "../plugins/negate.js";

import { BinaryPlugin } from "../plugins/binary.js";
import { HexPlugin } from "../plugins/hex.js";
import { BinaryToNumberPlugin } from "../plugins/binary_to_number.js";
import { HexToNumberPlugin } from "../plugins/hex_to_number.js";

import { InRangePlugin } from "../plugins/in_range.js";
import { ReverseNumberPlugin } from "../plugins/reverse_number.js";
import { DecimalPartPlugin } from "../plugins/decimal_part.js";
import { IntegerPartPlugin } from "../plugins/integer_part.js";

import { ReverseStringPlugin } from "../plugins/reverse_string.js";
import { FirstCharPlugin } from "../plugins/first_char.js";
import { LastCharPlugin } from "../plugins/last_char.js";
import { IsNumberPlugin } from "../plugins/is_number.js";
import { IsEmptyPlugin } from "../plugins/is_empty.js";

import { ListPlugin } from "../plugins/list.js";
import { ImportPackagePlugin } from "../plugins/import_package.js";


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

        this.version = "2.2.0";

        this.runtime = new Runtime(output);
        this.parser = new JapaneseParser();
        this.plugins = new PluginManager();
        this.packageManager = new PackageManager();

        this.registerPlugins();
    }


    registerPlugins() {

        // 基本
        this.plugins.register(new DisplayPlugin());
        this.plugins.register(new VariablePlugin());
        this.plugins.register(new InputPlugin());
        this.plugins.register(new CalculatePlugin());
        this.plugins.register(new WaitPlugin());

        // 数値・計算
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

        // 集計
        this.plugins.register(new AveragePlugin());
        this.plugins.register(new SumPlugin());
        this.plugins.register(new RangePlugin());

        // 数値判定
        this.plugins.register(new EvenPlugin());
        this.plugins.register(new OddPlugin());
        this.plugins.register(new PositivePlugin());
        this.plugins.register(new NegativePlugin());
        this.plugins.register(new ZeroPlugin());

        // 文字列
        this.plugins.register(new StringLengthPlugin());
        this.plugins.register(new StringFindPlugin());
        this.plugins.register(new StringReplacePlugin());
        this.plugins.register(new StringSlicePlugin());
        this.plugins.register(new StripPlugin());
        this.plugins.register(new ContainsPlugin());

        // 数学
        this.plugins.register(new SqrtPlugin());
        this.plugins.register(new PowerPlugin());
        this.plugins.register(new FloorPlugin());
        this.plugins.register(new CeilPlugin());
        this.plugins.register(new RandomPlugin());

        // 数学・整数
        this.plugins.register(new GcdPlugin());
        this.plugins.register(new LcmPlugin());
        this.plugins.register(new PrimePlugin());
        this.plugins.register(new FactorialPlugin());
        this.plugins.register(new SignPlugin());
        this.plugins.register(new NegatePlugin());

        // 基数変換
        this.plugins.register(new BinaryPlugin());
        this.plugins.register(new HexPlugin());
        this.plugins.register(new BinaryToNumberPlugin());
        this.plugins.register(new HexToNumberPlugin());

        // 数値操作
        this.plugins.register(new InRangePlugin());
        this.plugins.register(new ReverseNumberPlugin());
        this.plugins.register(new DecimalPartPlugin());
        this.plugins.register(new IntegerPartPlugin());

        // 文字列操作
        this.plugins.register(new ReverseStringPlugin());
        this.plugins.register(new FirstCharPlugin());
        this.plugins.register(new LastCharPlugin());
        this.plugins.register(new IsNumberPlugin());
        this.plugins.register(new IsEmptyPlugin());

        // リスト
        this.plugins.register(new ListPlugin());
        this.plugins.register(new ImportPackagePlugin());
    }


    async importPackage(repository) {
        const packageData =
            await this.packageManager.install(repository);

        const lines =
            packageData.source.split(/\r?\n/);

        this.validateBlocks(lines);

        await this.executeLines(
            lines,
            0,
            lines.length
        );

        return packageData;
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

            if (line === "終わり") {

                return {
                    index: i,
                    type: "end"
                };
            }

            if (line === "それ以外") {

                return {
                    index: i,
                    type: "else"
                };
            }

            if (line === "抜ける") {

                return {
                    index: i,
                    type: "break"
                };
            }

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
