import { WebPlugin } from "../engine/plugin.js";

export class RepeatPlugin extends WebPlugin {
    constructor() {
        super("繰り返す");
    }

    async execute(line, context) {
        throw new Error(
            "繰り返す はエンジンのブロック処理から実行されます。"
        );
    }
}