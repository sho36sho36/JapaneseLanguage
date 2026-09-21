import { WebPlugin } from "../engine/plugin.js";

export class StringFindPlugin extends WebPlugin {
    constructor() {
        super("文字を探す");
    }

    async execute(line, context) {
        const match = line.match(/^文字を探す\s+「(.+)」\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            match[1].indexOf(match[2])
        );
    }
}