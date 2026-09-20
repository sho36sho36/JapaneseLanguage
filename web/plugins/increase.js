import { WebPlugin } from "../engine/plugin.js";

export class IncreasePlugin extends WebPlugin {
    constructor() {
        super("増やす");
    }

    async execute(line, context) {
        const match = line.match(
            /^増やす\s+(.+?)\s+(.+)$/
        );

        if (!match) {
            throw new Error(
                `増やすの書式が正しくありません: ${line}`
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
            current + amount
        );
    }
}