import { WebPlugin } from "../engine/plugin.js";

export class ReverseNumberPlugin extends WebPlugin {
    constructor() {
        super("正負を反転");
    }

    async execute(line, context) {
        const expression = line.replace(/^正負を反転\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(-value);
    }
}