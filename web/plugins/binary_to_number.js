import { WebPlugin } from "../engine/plugin.js";

export class BinaryToNumberPlugin extends WebPlugin {
    constructor() {
        super("2進数を数字にする");
    }

    async execute(line, context) {
        const match = line.match(/^2進数を数字にする\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            parseInt(match[1], 2)
        );
    }
}