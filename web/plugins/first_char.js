import { WebPlugin } from "../engine/plugin.js";

export class FirstCharPlugin extends WebPlugin {
    constructor() {
        super("文字の先頭");
    }

    async execute(line, context) {
        const match = line.match(/^文字の先頭\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            [...match[1]][0] ?? ""
        );
    }
}