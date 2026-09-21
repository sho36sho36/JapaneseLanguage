import { WebPlugin } from "../engine/plugin.js";

export class NegatePlugin extends WebPlugin {
    constructor() {
        super("数値を反転");
    }

    async execute(line, context) {
        const expression = line.replace(/^数値を反転\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(-value);
    }
}