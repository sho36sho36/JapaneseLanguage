import { WebPlugin } from "../engine/plugin.js";

export class StringSlicePlugin extends WebPlugin {
    constructor() {
        super("文字を切り出す");
    }

    async execute(line, context) {
        const match = line.match(/^文字を切り出す\s+「(.+)」\s+(.+)\s+(.+)$/);
        if (!match) return;

        const start = Number(
            context.parser.parseValue(match[2], context.runtime)
        );

        const end = Number(
            context.parser.parseValue(match[3], context.runtime)
        );

        context.runtime.write(
            match[1].slice(start, end)
        );
    }
}