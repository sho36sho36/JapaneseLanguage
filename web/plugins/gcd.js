import { WebPlugin } from "../engine/plugin.js";

export class GcdPlugin extends WebPlugin {
    constructor() {
        super("最大公約数");
    }

    async execute(line, context) {
        const match = line.match(/^最大公約数\s+(.+)\s+(.+)$/);
        if (!match) return;

        let a = Math.abs(Number(
            context.parser.parseValue(match[1], context.runtime)
        ));

        let b = Math.abs(Number(
            context.parser.parseValue(match[2], context.runtime)
        ));

        while (b !== 0) {
            [a, b] = [b, a % b];
        }

        context.runtime.write(a);
    }
}