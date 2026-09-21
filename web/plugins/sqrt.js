import { WebPlugin } from "../engine/plugin.js";

export class SqrtPlugin extends WebPlugin {
    constructor() {
        super("平方根");
    }

    async execute(line, context) {
        const expression = line.replace(/^平方根\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(Math.sqrt(value));
    }
}