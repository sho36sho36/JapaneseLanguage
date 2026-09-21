import { WebPlugin } from "../engine/plugin.js";

export class PositivePlugin extends WebPlugin {
    constructor() {
        super("正数か");
    }

    async execute(line, context) {
        const expression = line.replace(/^正数か\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(value > 0);
    }
}