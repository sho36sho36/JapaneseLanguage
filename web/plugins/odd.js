import { WebPlugin } from "../engine/plugin.js";

export class OddPlugin extends WebPlugin {
    constructor() {
        super("奇数か");
    }

    async execute(line, context) {
        const expression = line.replace(/^奇数か\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(value % 2 !== 0);
    }
}