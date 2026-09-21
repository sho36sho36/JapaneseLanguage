import { WebPlugin } from "../engine/plugin.js";

export class RangePlugin extends WebPlugin {
    constructor() {
        super("範囲");
    }

    async execute(line, context) {
        const expression = line.replace(/^範囲\s*/, "");
        const values = expression.split(",").map(v =>
            Number(context.parser.parseValue(v.trim(), context.runtime))
        );

        context.runtime.write(
            Math.max(...values) - Math.min(...values)
        );
    }
}