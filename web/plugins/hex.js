import { WebPlugin } from "../engine/plugin.js";

export class HexPlugin extends WebPlugin {
    constructor() {
        super("数値を16進数にする");
    }

    async execute(line, context) {
        const expression = line.replace(/^数値を16進数にする\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(
            Math.trunc(value).toString(16)
        );
    }
}