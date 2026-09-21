import { WebPlugin } from "../engine/plugin.js";

export class LcmPlugin extends WebPlugin {
    constructor() {
        super("最小公倍数");
    }

    async execute(line, context) {
        const match = line.match(/^最小公倍数\s+(.+)\s+(.+)$/);
        if (!match) return;

        let a = Math.abs(Number(
            context.parser.parseValue(match[1], context.runtime)
        ));

        let b = Math.abs(Number(
            context.parser.parseValue(match[2], context.runtime)
        ));

        const originalA = a;
        const originalB = b;

        while (b !== 0) {
            [a, b] = [b, a % b];
        }

        context.runtime.write(
            originalA === 0 || originalB === 0
                ? 0
                : Math.abs(originalA * originalB) / a
        );
    }
}