import { WebPlugin } from "../engine/plugin.js";

export class ToStringPlugin extends WebPlugin {
    constructor() {
        super("文字にする");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^文字にする\s*/, "");

        const value = context.parser.parseValue(
            expression,
            context.runtime
        );

        context.runtime.write(
            String(value)
        );
    }
}