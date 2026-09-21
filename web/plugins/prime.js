import { WebPlugin } from "../engine/plugin.js";

export class PrimePlugin extends WebPlugin {
    constructor() {
        super("素数か");
    }

    async execute(line, context) {
        const expression = line.replace(/^素数か\s*/, "");
        const n = Number(
            context.parser.parseValue(expression, context.runtime)
        );

        if (n < 2 || !Number.isInteger(n)) {
            context.runtime.write(false);
            return;
        }

        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) {
                context.runtime.write(false);
                return;
            }
        }

        context.runtime.write(true);
    }
}