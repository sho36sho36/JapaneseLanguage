import { WebPlugin } from "../engine/plugin.js";

export class ImportPackagePlugin extends WebPlugin {
    constructor() {
        super("読み込む");
    }

    matches(line) {
        return /^読み込む「.+」$/.test(line);
    }

    async execute(line, context) {
        const match =
            line.match(/^読み込む「(.+)」$/);

        if (!match) {
            throw new Error(
                "読み込むの形式が正しくありません。"
            );
        }

        await context.engine.importPackage(
            match[1]
        );
    }
}
