import { WebPlugin } from "../engine/plugin.js";

export class AveragePlugin extends WebPlugin {
    constructor() {
        super("平均");
    }

    async execute(line, context) {
        const expression = line.replace(/^平均\s*/, "");
        const values = expression.split(",").map(v =>
            Number(context.parser.parseValue(v.trim(), context.runtime))
        );

        context.runtime.write(
            values.reduce((a, b) => a + b, 0) / values.length
        );
    }
}