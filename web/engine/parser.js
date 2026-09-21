export class JapaneseParser {

    constructor() {

        this.operators = [
            "===",
            "!==",
            ">=",
            "<=",
            "==",
            "!=",
            ">",
            "<",
            "+",
            "-",
            "*",
            "/",
            "%"
        ];
    }


    // ============================================================
    // 値を解析
    // ============================================================

    parseValue(expression, runtime) {

        if (
            expression === undefined ||
            expression === null
        ) {
            return "";
        }

        let value = String(expression).trim();


        if (value === "") {
            return "";
        }


        // 日本語文字列
        if (
            value.startsWith("「") &&
            value.endsWith("」")
        ) {
            return value.slice(1, -1);
        }


        // "文字列"
        if (
            value.length >= 2 &&
            value.startsWith('"') &&
            value.endsWith('"')
        ) {
            return value.slice(1, -1);
        }


        // '文字列'
        if (
            value.length >= 2 &&
            value.startsWith("'") &&
            value.endsWith("'")
        ) {
            return value.slice(1, -1);
        }


        // 真偽値
        if (value === "true") {
            return true;
        }

        if (value === "false") {
            return false;
        }

        if (value === "真") {
            return true;
        }

        if (value === "偽") {
            return false;
        }


        // null
        if (
            value === "null" ||
            value === "なし"
        ) {
            return null;
        }


        // 数値
        if (
            /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)
        ) {
            return Number(value);
        }


        // 変数
        if (
            runtime &&
            runtime.exists(value)
        ) {
            return runtime.get(value);
        }


        // 配列インデックス
        const indexMatch = value.match(
            /^(.+)\[(-?\d+)\]$/
        );

        if (
            indexMatch &&
            runtime
        ) {

            const [, name, indexText] =
                indexMatch;

            const target =
                runtime.get(name.trim());

            const index =
                Number(indexText);

            if (Array.isArray(target)) {
                return target[index];
            }
        }


        // 計算式
        if (this.looksLikeExpression(value)) {

            try {

                return this.evaluate(
                    value,
                    runtime
                );

            } catch {

                // 文字列として扱う
            }
        }


        return value;
    }


    // ============================================================
    // 数値として解析
    // ============================================================

    parseNumber(expression, runtime) {

        const value =
            this.parseValue(
                expression,
                runtime
            );

        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {

            throw new Error(
                `「${expression}」は数値ではありません。`
            );
        }

        return value;
    }


    // ============================================================
    // 計算式かどうか
    // ============================================================

    looksLikeExpression(expression) {

        return (
            /[+\-*/%]/.test(expression) ||
            />=|<=|===|!==|==|!=|>|</.test(expression)
        );
    }


    // ============================================================
    // 計算・条件式
    // ============================================================

    evaluate(expression, runtime) {

        let expr =
            String(expression).trim();


        if (expr === "") {
            throw new Error(
                "式が空です。"
            );
        }


        // 真偽値
        expr = expr
            .replace(/\b真\b/g, "true")
            .replace(/\b偽\b/g, "false");


        // 日本語文字列
        expr = expr.replace(
            /「([^「」]*)」/g,
            (_, text) =>
                JSON.stringify(text)
        );


        // 変数
        const variables = [];

        if (runtime) {

            for (
                const name of runtime.names()
            ) {

                const safeName =
                    `__jp_var_${variables.length}`;

                variables.push({
                    name,
                    safeName,
                    value: runtime.get(name)
                });

                const escapedName =
                    this.escapeRegExp(name);

                expr = expr.replace(
                    new RegExp(
                        `(?<![\\w])${escapedName}(?![\\w])`,
                        "g"
                    ),
                    safeName
                );
            }
        }


        try {

            const names =
                variables.map(
                    item => item.safeName
                );

            const values =
                variables.map(
                    item => item.value
                );


            const fn = new Function(
                ...names,
                `"use strict"; return (${expr});`
            );


            const result =
                fn(...values);


            return result;

        } catch (error) {

            throw new Error(
                `式「${expression}」を計算できません。`
            );
        }
    }


    // ============================================================
    // 引数を分割
    // ============================================================

    splitArguments(expression) {

        const result = [];

        let current = "";
        let depth = 0;

        let inJapaneseQuote = false;
        let inDoubleQuote = false;
        let inSingleQuote = false;


        for (
            const char of String(expression)
        ) {

            // 「
            if (
                char === "「" &&
                !inDoubleQuote &&
                !inSingleQuote
            ) {

                inJapaneseQuote = true;

                current += char;

                continue;
            }


            // 」
            if (
                char === "」" &&
                inJapaneseQuote
            ) {

                inJapaneseQuote = false;

                current += char;

                continue;
            }


            // "
            if (
                char === '"' &&
                !inJapaneseQuote &&
                !inSingleQuote
            ) {

                inDoubleQuote =
                    !inDoubleQuote;

                current += char;

                continue;
            }


            // '
            if (
                char === "'" &&
                !inJapaneseQuote &&
                !inDoubleQuote
            ) {

                inSingleQuote =
                    !inSingleQuote;

                current += char;

                continue;
            }


            // (
            if (
                char === "(" &&
                !inJapaneseQuote &&
                !inDoubleQuote &&
                !inSingleQuote
            ) {

                depth++;

                current += char;

                continue;
            }


            // )
            if (
                char === ")" &&
                !inJapaneseQuote &&
                !inDoubleQuote &&
                !inSingleQuote
            ) {

                depth =
                    Math.max(
                        0,
                        depth - 1
                    );

                current += char;

                continue;
            }


            // ,
            if (
                char === "," &&
                !inJapaneseQuote &&
                !inDoubleQuote &&
                !inSingleQuote &&
                depth === 0
            ) {

                if (
                    current.trim() !== ""
                ) {

                    result.push(
                        current.trim()
                    );
                }

                current = "";

                continue;
            }


            current += char;
        }


        if (
            current.trim() !== ""
        ) {

            result.push(
                current.trim()
            );
        }


        return result;
    }


    // ============================================================
    // 正規表現用エスケープ
    // ============================================================

    escapeRegExp(text) {

        return String(text).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }
}