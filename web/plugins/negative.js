import { WebPlugin } from "../engine/plugin.js";

export class NegativePlugin extends WebPlugin {
    constructor() {
        super("負数か");
    }

    async execute(line, context) {
        const expression = line.replace(/^負数か\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(value < 0);
    }
}