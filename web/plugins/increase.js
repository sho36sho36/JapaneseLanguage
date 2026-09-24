import { WebPlugin } from "../engine/plugin.js";

export class IncreasePlugin extends WebPlugin {
    constructor() {
        super("増やす");
    }

    async execute(line, context) {
        const match = line.match(/^増やす\s+(.+?)\s+(.+)$/);

        if (!match) {
            throw new Error(`増やすの書式が正しくありません: ${line}`);
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

            context.runtime.set(target, current + amount);
            return;
        }

        const current = context.parser.parseNumber(
            target,
            context.runtime
        );

        context.runtime.write(current + amount);
    }
}
