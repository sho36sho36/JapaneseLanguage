import { WebPlugin } from "../engine/plugin.js";

export class MinMaxRangePlugin extends WebPlugin {
    constructor() {
        super("数値の範囲");
    }

    async execute(line, context) {
        const expression = line.replace(/^数値の範囲\s*/, "");
        const values = expression.split(",").map(v =>
            Number(context.parser.parseValue(v.trim(), context.runtime))
        );

        context.runtime.write({
            最小: Math.min(...values),
            最大: Math.max(...values)
        });
    }
}