import { WebPlugin } from "../engine/plugin.js";

export class AbsolutePlugin extends WebPlugin {
    constructor() {
        super("絶対値");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^絶対値\s*/, "");

        const value = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        context.runtime.write(
            Math.abs(value)
        );
    }
}