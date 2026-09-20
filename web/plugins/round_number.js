import { WebPlugin } from "../engine/plugin.js";

export class RoundNumberPlugin extends WebPlugin {
    constructor() {
        super("四捨五入");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^四捨五入\s*/, "");

        const value = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        context.runtime.write(
            Math.round(value)
        );
    }
}