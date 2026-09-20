import { WebPlugin } from "../engine/plugin.js";

export class IfPlugin extends WebPlugin {
    constructor() {
        super("もし");
    }

    async execute(line, context) {
        throw new Error(
            "もし はエンジンのブロック処理から実行されます。"
        );
    }
}