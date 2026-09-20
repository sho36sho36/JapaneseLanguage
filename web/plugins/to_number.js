import { WebPlugin } from "../engine/plugin.js";

export class ToNumberPlugin extends WebPlugin {
    constructor() {
        super("数字にする");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^数字にする\s*/, "");

        const value = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        context.runtime.write(value);
    }
}