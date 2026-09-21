import { WebPlugin } from "../engine/plugin.js";

export class InRangePlugin extends WebPlugin {
    constructor() {
        super("数値の範囲内か");
    }

    async execute(line, context) {
        const match = line.match(/^数値の範囲内か\s+(.+)\s+(.+)\s+(.+)$/);
        if (!match) return;

        const value = Number(
            context.parser.parseValue(match[1], context.runtime)
        );

        const min = Number(
            context.parser.parseValue(match[2], context.runtime)
        );

        const max = Number(
            context.parser.parseValue(match[3], context.runtime)
        );

        context.runtime.write(
            value >= min && value <= max
        );
    }
}