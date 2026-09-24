import { WebPlugin } from "../engine/plugin.js";

export class DividePlugin extends WebPlugin {
    constructor() {
        super("割る");
    }

    async execute(line, context) {
        const match = line.match(/^割る\s+(.+?)\s+(.+)$/);

        if (!match) {
            throw new Error(`割るの書式が正しくありません: ${line}`);
        }

        const [, target, expression] = match;

        const value = context.parser.parseNumber(
            expression,
            context.runtime
        );

        if (value === 0) {
            throw new Error("0で割ることはできません。");
        }

        if (context.runtime.exists(target)) {
            const current = context.parser.parseNumber(
                target,
                context.runtime
            );

            context.runtime.set(target, current / value);
            return;
        }

        const current = context.parser.parseNumber(
            target,
            context.runtime
        );

        context.runtime.write(current / value);
    }
}
