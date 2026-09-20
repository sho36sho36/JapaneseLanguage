import { WebPlugin } from "../engine/plugin.js";

export class LowerPlugin extends WebPlugin {
    constructor() {
        super("小文字にする");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^小文字にする\s*/, "");

        const value = context.parser.parseValue(
            expression,
            context.runtime
        );

        context.runtime.write(
            String(value).toLowerCase()
        );
    }
}