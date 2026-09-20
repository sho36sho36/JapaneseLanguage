import { WebPlugin } from "../engine/plugin.js";

export class MultiplyPlugin extends WebPlugin {
    constructor() {
        super("掛ける");
    }

    async execute(line, context) {
        const match = line.match(
            /^掛ける\s+(.+?)\s+(.+)$/
        );

        if (!match) {
            throw new Error(
                `掛けるの書式が正しくありません: ${line}`
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

        context.runtime.set(
            name,
            current * value
        );
    }
}