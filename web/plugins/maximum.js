import { WebPlugin } from "../engine/plugin.js";

export class MaximumPlugin extends WebPlugin {
    constructor() {
        super("最大");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^最大\s*/, "");

        const values = context.parser
            .splitArguments(expression)
            .map(value =>
                Number(
                    context.parser.parseValue(
                        value,
                        context.runtime
                    )
                )
            );

        context.runtime.write(
            Math.max(...values)
        );
    }
}