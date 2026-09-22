import { WebPlugin } from "../engine/plugin.js";

export class DecimalPartPlugin extends WebPlugin {
    constructor() {
        super("小数部分");
    }

    async execute(line, context) {
        const expression = line.replace(/^小数部分\s*/, "");

        const value = Number(
            context.parser.parseValue(
                expression,
                context.runtime
            )
        );

        const integerPart = Math.trunc(value);
        const decimalPart = value - integerPart;

        const roundedDecimalPart =
            Math.round(
                (decimalPart + Number.EPSILON) * 1e12
            ) / 1e12;

        context.runtime.write(
            roundedDecimalPart
        );
    }
}