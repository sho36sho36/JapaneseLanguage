import { WebPlugin } from "../engine/plugin.js";

export class ListPlugin extends WebPlugin {
    constructor() {
        super("リスト");
    }

    async execute(line, context) {
        let match;

        // リスト「名前」を作る
        match = line.match(
            /^リスト「([^「」]+)」を作る$/
        );

        if (match) {
            const [, name] = match;
            context.runtime.set(name, []);
            return;
        }

        // リスト「名前」に「値」を追加する
        match = line.match(
            /^リスト「([^「」]+)」に(.+)を追加する$/
        );

        if (match) {
            const [, name, expression] = match;

            const list = context.runtime.get(name);

            if (!Array.isArray(list)) {
                throw new Error(
                    `「${name}」はリストではありません。`
                );
            }

            const value = context.parser.parseValue(
                expression.trim(),
                context.runtime
            );

            list.push(value);
            return;
        }

        // リスト「名前」から「値」を削除する
        match = line.match(
            /^リスト「([^「」]+)」から(.+)を削除する$/
        );

        if (match) {
            const [, name, expression] = match;

            const list = context.runtime.get(name);

            if (!Array.isArray(list)) {
                throw new Error(
                    `「${name}」はリストではありません。`
                );
            }

            const value = context.parser.parseValue(
                expression.trim(),
                context.runtime
            );

            const index = list.indexOf(value);

            if (index !== -1) {
                list.splice(index, 1);
            }

            return;
        }

        // リスト「名前」から取り出す 0
        match = line.match(
            /^リスト「([^「」]+)」から取り出す\s+(.+)$/
        );

        if (match) {
            const [, name, expression] = match;

            const list = context.runtime.get(name);

            if (!Array.isArray(list)) {
                throw new Error(
                    `「${name}」はリストではありません。`
                );
            }

            const index = Number(
                context.parser.parseValue(
                    expression,
                    context.runtime
                )
            );

            context.runtime.write(
                list[index]
            );

            return;
        }

        // リスト「名前」の長さ
        match = line.match(
            /^リスト「([^「」]+)」の長さ$/
        );

        if (match) {
            const [, name] = match;

            const list = context.runtime.get(name);

            if (!Array.isArray(list)) {
                throw new Error(
                    `「${name}」はリストではありません。`
                );
            }

            context.runtime.write(
                list.length
            );

            return;
        }

        throw new Error(
            `リストの書式が正しくありません: ${line}`
        );
    }
}