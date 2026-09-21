import { WebPlugin } from "../engine/plugin.js";

export class SumPlugin extends WebPlugin {
    constructor() {
        super("合計");
    }

    async execute(line, context) {
        const expression = line.replace(/^合計\s*/, "");
        const values = expression.split(",").map(v =>
            Number(context.parser.parseValue(v.trim(), context.runtime))
        );

        context.runtime.write(
            values.reduce((a, b) => a + b, 0)
        );
    }
}