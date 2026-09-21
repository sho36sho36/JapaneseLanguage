import { WebPlugin } from "../engine/plugin.js";

export class IsNumberPlugin extends WebPlugin {
    constructor() {
        super("文字が数字か");
    }

    async execute(line, context) {
        const match = line.match(/^文字が数字か\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            /^[0-9]+(?:\.[0-9]+)?$/.test(match[1])
        );
    }
}