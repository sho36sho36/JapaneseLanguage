import { WebPlugin } from "../engine/plugin.js";

export class EvenPlugin extends WebPlugin {
    constructor() {
        super("偶数か");
    }

    async execute(line, context) {
        const expression = line.replace(/^偶数か\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(value % 2 === 0);
    }
}