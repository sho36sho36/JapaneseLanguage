import { WebPlugin } from "../engine/plugin.js";

export class WaitPlugin extends WebPlugin {
    constructor() {
        super("待つ");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^待つ\s*/, "");

        const seconds = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        if (!Number.isFinite(seconds)) {
            throw new Error(
                `待つには数字を指定してください: ${line}`
            );
        }

        await new Promise(resolve => {
            setTimeout(resolve, Math.max(0, seconds * 1000));
        });
    }
}