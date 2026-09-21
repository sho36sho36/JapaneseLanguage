import { WebPlugin } from "../engine/plugin.js";

export class ContainsPlugin extends WebPlugin {
    constructor() {
        super("文字が含まれる");
    }

    async execute(line, context) {
        const match = line.match(/^文字が含まれる\s+「(.+)」\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            match[1].includes(match[2])
        );
    }
}