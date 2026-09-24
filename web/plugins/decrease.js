import { WebPlugin } from "../engine/plugin.js";

export class DecreasePlugin extends WebPlugin {
    constructor() {
        super("減らす");
    }

    async execute(line, context) {
        const match = line.match(/^減らす\s+(.+?)\s+(.+)$/);

        if (!match) {
            throw new Error(`減らすの書式が正しくありません: ${line}`);
        }

        const [, target, amountExpression] = match;

        const amount = context.parser.parseNumber(
            amountExpression,
            context.runtime
        );

        if (context.runtime.exists(target)) {
            const current = context.parser.parseNumber(
                target,
                context.runtime
            );

            context.runtime.set(target, current - amount);
            return;
        }

        const current = context.parser.parseNumber(
            target,
            context.runtime
        );

        context.runtime.write(current - amount);
    }
}
