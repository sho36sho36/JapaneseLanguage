import { WebPlugin } from "../engine/plugin.js";

export class ConcatPlugin extends WebPlugin {
    constructor() {
        super("文字をつなぐ");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^文字をつなぐ\s*/, "");

        const values = context.parser
            .splitArguments(expression)
            .map(value =>
                context.parser.parseValue(
                    value,
                    context.runtime
                )
            );

        context.runtime.write(
            values.map(String).join("")
        );
    }
}