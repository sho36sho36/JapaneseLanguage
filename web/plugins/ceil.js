import { WebPlugin } from "../engine/plugin.js";

export class CeilPlugin extends WebPlugin {
    constructor() {
        super("切り上げ");
    }

    async execute(line, context) {
        const expression = line.replace(/^切り上げ\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(Math.ceil(value));
    }
}