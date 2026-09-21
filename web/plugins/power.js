import { WebPlugin } from "../engine/plugin.js";

export class PowerPlugin extends WebPlugin {
    constructor() {
        super("べき乗");
    }

    async execute(line, context) {
        const match = line.match(/^べき乗\s+(.+)\s+(.+)$/);
        if (!match) return;

        const a = Number(
            context.parser.parseValue(match[1], context.runtime)
        );

        const b = Number(
            context.parser.parseValue(match[2], context.runtime)
        );

        context.runtime.write(Math.pow(a, b));
    }
}