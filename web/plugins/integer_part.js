import { WebPlugin } from "../engine/plugin.js";

export class IntegerPartPlugin extends WebPlugin {
    constructor() {
        super("整数部分");
    }

    async execute(line, context) {
        const expression = line.replace(/^整数部分\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(Math.trunc(value));
    }
}