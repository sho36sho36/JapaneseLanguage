import { WebPlugin } from "../engine/plugin.js";

export class HexToNumberPlugin extends WebPlugin {
    constructor() {
        super("16進数を数字にする");
    }

    async execute(line, context) {
        const match = line.match(/^16進数を数字にする\s+「(.+)」$/);
        if (!match) return;

        context.runtime.write(
            parseInt(match[1], 16)
        );
    }
}