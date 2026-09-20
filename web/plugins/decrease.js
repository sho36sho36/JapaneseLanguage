import { WebPlugin } from "../engine/plugin.js";

export class DecreasePlugin extends WebPlugin {
    constructor() {
        super("減らす");
    }

    async execute(line, context) {
        const match = line.match(
            /^減らす\s+(.+?)\s+(.+)$/
        );

        if (!match) {
            throw new Error(
                `減らすの書式が正しくありません: ${line}`
            );
        }

        const [, name, amountExpression] = match;

        const current = Number(
            context.runtime.get(name)
        );

        const amount = Number(
            context.parser.parseValue(
                amountExpression,
                context.runtime
            )
        );

        context.runtime.set(
            name,
            current - amount
        );
    }
}