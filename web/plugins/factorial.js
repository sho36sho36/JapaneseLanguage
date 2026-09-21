import { WebPlugin } from "../engine/plugin.js";

export class FactorialPlugin extends WebPlugin {
    constructor() {
        super("階乗");
    }

    async execute(line, context) {
        const expression = line.replace(/^階乗\s*/, "");
        const n = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        let result = 1;

        for (let i = 2; i <= n; i++) {
            result *= i;
        }

        context.runtime.write(result);
    }
}