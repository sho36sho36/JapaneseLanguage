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

export class WebEngine {
    constructor(output = null) {
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

            // もし
            if (line.startsWith("もし ")) {
                const condition = line
                    .replace(/^もし\s*/, "");

                const block = this.findBlock(
                    lines,
                    i,
                    end
                );

                const result = this.parser.evaluate(
                    condition,
                    this.runtime
                );

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

            // 繰り返す
            if (line.startsWith("繰り返す ")) {
                const expression = line
                    .replace(/^繰り返す\s*/, "")
                    .replace(/回$/, "")
                    .trim();

                const count = Number(
                    this.parser.parseValue(
                        expression,
                        this.runtime
                    )
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

            const handled =
                await this.plugins.execute(
                    line,
                    context
                );

            if (!handled) {
                throw new Error(
                    `行 ${i + 1}: 理解できない命令です: ${line}`
                );
            }
        }

        return null;
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

        throw new Error(
            `行 ${start + 1}: 「終わり」がありません。`
        );
    }
}