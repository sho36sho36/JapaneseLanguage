import { WebPlugin } from "../engine/plugin.js";

export class IsEmptyPlugin extends WebPlugin {
    constructor() {
        super("文字が空か");
    }

    async execute(line, context) {
        const match = line.match(/^文字が空か\s+「(.*)」$/);
        if (!match) return;

        context.runtime.write(
            match[1].length === 0
        );
    }
}