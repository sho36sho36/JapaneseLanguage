import { WebPlugin } from "../engine/plugin.js";

export class BinaryPlugin extends WebPlugin {
    constructor() {
        super("数値を2進数にする");
    }

    async execute(line, context) {
        const expression = line.replace(/^数値を2進数にする\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(
            Math.trunc(value).toString(2)
        );
    }
}