import { WebPlugin } from "../engine/plugin.js";

export class MinimumPlugin extends WebPlugin {
    constructor() {
        super("最小");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^最小\s*/, "");

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
            Math.min(...values)
        );
    }
}