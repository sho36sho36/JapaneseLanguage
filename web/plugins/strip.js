import { WebPlugin } from "../engine/plugin.js";

export class StripPlugin extends WebPlugin {
    constructor() {
        super("空白を消す");
    }

    async execute(line, context) {
        const match = line.match(/^空白を消す\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            match[1].trim()
        );
    }
}