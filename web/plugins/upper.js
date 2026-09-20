import { WebPlugin } from "../engine/plugin.js";

export class UpperPlugin extends WebPlugin {
    constructor() {
        super("大文字にする");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^大文字にする\s*/, "");

        const value = context.parser.parseValue(
            expression,
            context.runtime
        );

        context.runtime.write(
            String(value).toUpperCase()
        );
    }
}