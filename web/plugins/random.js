import { WebPlugin } from "../engine/plugin.js";

export class RandomPlugin extends WebPlugin {
    constructor() {
        super("乱数");
    }

    async execute(line, context) {
        const match = line.match(/^乱数\s+(.+)\s+(.+)$/);
        if (!match) return;

        const min = Number(
            context.parser.parseValue(match[1], context.runtime)
        );

        const max = Number(
            context.parser.parseValue(match[2], context.runtime)
        );

        context.runtime.write(
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }
}