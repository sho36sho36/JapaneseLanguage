import { WebPlugin } from "../engine/plugin.js";

export class CalculatePlugin extends WebPlugin {
    constructor() {
        super("計算する");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^計算する\s*/, "");

        const value = context.parser.evaluate(
            expression,
            context.runtime
        );

        context.runtime.write(value);
    }
}