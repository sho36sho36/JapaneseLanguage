import { WebPlugin } from "../engine/plugin.js";

export class LastCharPlugin extends WebPlugin {
    constructor() {
        super("文字の末尾");
    }

    async execute(line, context) {
        const match = line.match(/^文字の末尾\s+「(.+)」$/);
        if (!match) return;

        const chars = [...match[1]];

        context.runtime.write(
            chars.length > 0 ? chars[chars.length - 1] : ""
        );
    }
}