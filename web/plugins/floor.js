import { WebPlugin } from "../engine/plugin.js";

export class FloorPlugin extends WebPlugin {
    constructor() {
        super("切り捨て");
    }

    async execute(line, context) {
        const expression = line.replace(/^切り捨て\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(Math.floor(value));
    }
}