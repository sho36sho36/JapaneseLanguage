import { WebPlugin } from "../engine/plugin.js";

export class VariablePlugin extends WebPlugin {
    constructor() {
        super("変数");
    }

    async execute(line, context) {
        const match = line.match(
            /^変数「([^「」]+)」に入れる(?:\s*)(.+)$/
        );

        if (!match) {
            throw new Error(
                `変数の書式が正しくありません: ${line}`
            );
        }

        const [, name, expression] = match;

        const value = context.parser.parseValue(
            expression.trim(),
            context.runtime
        );

        context.runtime.set(name, value);
    }
}