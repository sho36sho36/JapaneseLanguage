import { WebPlugin } from "../engine/plugin.js";

export class StringReplacePlugin extends WebPlugin {
    constructor() {
        super("文字を置き換える");
    }

    async execute(line, context) {
        const match = line.match(/^文字を置き換える\s+「(.+)」\s+「(.+)」\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            match[1].split(match[2]).join(match[3])
        );
    }
}