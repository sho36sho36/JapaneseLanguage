import { WebPlugin } from "../engine/plugin.js";

export class DisplayPlugin extends WebPlugin {
    constructor() {
        super("表示する");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^表示する\s*/, "");

        const value = context.parser.parseValue(
            expression,
            context.runtime
        );

        context.runtime.write(value);
    }
}