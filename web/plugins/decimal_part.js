import { WebPlugin } from "../engine/plugin.js";

export class DecimalPartPlugin extends WebPlugin {
    constructor() {
        super("小数部分");
    }

    async execute(line, context) {
        const expression = line.replace(/^小数部分\s*/, "");
        const value = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        context.runtime.write(
            value - Math.trunc(value)
        );
    }
}