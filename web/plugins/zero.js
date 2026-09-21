import { WebPlugin } from "../engine/plugin.js";

export class ZeroPlugin extends WebPlugin {
    constructor() {
        super("0か");
    }

    async execute(line, context) {
        const expression = line.replace(/^0か\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(value === 0);
    }
}