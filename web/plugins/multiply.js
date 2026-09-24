import { WebPlugin } from "../engine/plugin.js";

export class MultiplyPlugin extends WebPlugin {
    constructor() {
        super("掛ける");
    }

    async execute(line, context) {
        const match = line.match(/^掛ける\s+(.+?)\s+(.+)$/);

        if (!match) {
            throw new Error(`掛けるの書式が正しくありません: ${line}`);
        }

        const [, target, expression] = match;

        const value = context.parser.parseNumber(
            expression,
            context.runtime
        );

        if (context.runtime.exists(target)) {
            const current = context.parser.parseNumber(
                target,
                context.runtime
            );

            context.runtime.set(target, current * value);
            return;
        }

        const current = context.parser.parseNumber(
            target,
            context.runtime
        );

        context.runtime.write(current * value);
    }
}
