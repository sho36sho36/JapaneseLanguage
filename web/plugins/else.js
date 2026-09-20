import { WebPlugin } from "../engine/plugin.js";

export class ElsePlugin extends WebPlugin {
    constructor() {
        super("それ以外");
    }

    async execute(line, context) {
        throw new Error(
            "それ以外 はエンジンのブロック処理から実行されます。"
        );
    }
}