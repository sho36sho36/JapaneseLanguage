import { WebPlugin } from "../engine/plugin.js";

export class RemainderPlugin extends WebPlugin {
    constructor() {
        super("余り");
    }

    async execute(line, context) {
        const match = line.match(
            /^余り\s+(.+?)\s+(.+)$/
        );

        if (!match) {
            throw new Error(
                `余りの書式が正しくありません: ${line}`
            );
        }

        const [, name, expression] = match;

        const current = Number(
            context.runtime.get(name)
        );

        const value = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        if (value === 0) {
            throw new Error(
                "0で割ることはできません。"
            );
        }

        context.runtime.set(
            name,
            current % value
        );
    }
}