import { WebPlugin } from "../engine/plugin.js";

export class InputPlugin extends WebPlugin {
    constructor() {
        super("入力する");
    }

    async execute(line, context) {
        const match = line.match(
            /^入力する\s+「([^「」]+)」(?:\s+(.+))?$/
        );

        if (!match) {
            throw new Error(
                `入力するの書式が正しくありません: ${line}`
            );
        }

        const [, variableName, message] = match;

        const promptMessage = message
            ? context.parser.parseValue(
                message,
                context.runtime
            )
            : variableName;

        const value = window.prompt(
            String(promptMessage)
        );

        context.runtime.set(
            variableName,
            value ?? ""
        );
    }
}