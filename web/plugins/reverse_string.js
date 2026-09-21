import { WebPlugin } from "../engine/plugin.js";

export class ReverseStringPlugin extends WebPlugin {
    constructor() {
        super("文字を反転");
    }

    async execute(line, context) {
        const match = line.match(/^文字を反転\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            [...match[1]].reverse().join("")
        );
    }
}