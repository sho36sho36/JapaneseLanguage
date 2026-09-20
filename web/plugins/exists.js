import { WebPlugin } from "../engine/plugin.js";

export class ExistsPlugin extends WebPlugin {
    constructor() {
        super("存在する");
    }

    async execute(line, context) {
        const expression = line
            .replace(/^存在する\s*/, "");

        const name = expression
            .replace(/^「|」$/g, "")
            .trim();

        context.runtime.write(
            context.runtime.exists(name)
        );
    }
}