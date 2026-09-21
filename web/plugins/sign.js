import { WebPlugin } from "../engine/plugin.js";

export class SignPlugin extends WebPlugin {
    constructor() {
        super("符号");
    }

    async execute(line, context) {
        const expression = line.replace(/^符号\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(Math.sign(value));
    }
}