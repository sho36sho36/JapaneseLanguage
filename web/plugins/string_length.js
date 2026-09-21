import { WebPlugin } from "../engine/plugin.js";

export class StringLengthPlugin extends WebPlugin {
    constructor() {
        super("文字の長さ");
    }

    async execute(line, context) {
        const match = line.match(/^文字の長さ\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(match[1].length);
    }
}