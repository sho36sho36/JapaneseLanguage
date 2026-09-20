import { WebPlugin } from "../engine/plugin.js";

export class EndPlugin extends WebPlugin {
    constructor() {
        super("終わり");
    }

    async execute(line, context) {
        throw new Error(
            "終わり はエンジンのブロック処理から実行されます。"
        );
    }
}