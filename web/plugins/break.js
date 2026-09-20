import { WebPlugin } from "../engine/plugin.js";

export class BreakPlugin extends WebPlugin {
    constructor() {
        super("抜ける");
    }

    async execute(line, context) {
        throw new Error(
            "抜ける はエンジンのブロック処理から実行されます。"
        );
    }
}