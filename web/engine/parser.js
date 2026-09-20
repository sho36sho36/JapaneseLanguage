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

    // ========================================
    // 値を解析
    // ========================================

    parseValue(expression, runtime) {
        if (expression === undefined || expression === null) {
            return "";
        }

        let value = String(expression).trim();

        // 空文字
        if (value === "") {
            return "";
        }

        // 「文字列」
        if (
            value.startsWith("「") &&
            value.endsWith("」")
        ) {
            return value.slice(1, -1);
        }

        // 通常の "文字列"
        if (
            value.length >= 2 &&
            value.startsWith('"') &&
            value.endsWith('"')
        ) {
            return value.slice(1, -1);
        }

        // 通常の '文字列'
        if (
            value.length >= 2 &&
            value.startsWith("'") &&
            value.endsWith("'")
        ) {
            return value.slice(1, -1);
        }

        // true / false
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
        if (runtime && runtime.exists(value)) {
            return runtime.get(value);
        }

        // 配列インデックス
        const indexMatch = value.match(
            /^(.+)\[(-?\d+)\]$/
        );

        if (indexMatch && runtime) {
            const [, name, indexText] = indexMatch;

            const target = runtime.get(
                name.trim()
            );

            const index = Number(indexText);

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
                // 計算式として失敗した場合は
                // 下の文字列として扱う
            }
        }

        // それ以外は文字列
        return value;
    }

    // ========================================
    // 計算式かどうか
    // ========================================

    looksLikeExpression(expression) {
        return (
            /[+\-*/%]/.test(expression) ||
            />=|<=|===|!==|==|!=|>|</.test(expression)
        );
    }

    // ========================================
    // 計算・条件式
    // ========================================

    evaluate(expression, runtime) {
        let expr = String(expression).trim();

        if (expr === "") {
            return "";
        }

        // 日本語の真偽値
        expr = expr
            .replace(/\b真\b/g, "true")
            .replace(/\b偽\b/g, "false");

        // 「文字列」を JavaScript 文字列へ
        expr = expr.replace(
            /「([^「」]*)」/g,
            (_, text) => JSON.stringify(text)
        );

        // 変数名を安全な一時変数へ置換
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

            return fn(...values);

        } catch (error) {
            throw new Error(
                `式を計算できません: ${expression}`
            );
        }
    }

    // ========================================
    // 引数を分割
    //
    // 例:
    // 10, 50, 20
    //
    // ↓
    // ["10", "50", "20"]
    // ========================================

    splitArguments(expression) {
        const result = [];

        let current = "";
        let depth = 0;
        let inJapaneseQuote = false;
        let inDoubleQuote = false;
        let inSingleQuote = false;

        for (const char of String(expression)) {

            // 「」
            if (
                char === "「" &&
                !inDoubleQuote &&
                !inSingleQuote
            ) {
                inJapaneseQuote = true;
                current += char;
                continue;
            }

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
                depth = Math.max(
                    0,
                    depth - 1
                );

                current += char;
                continue;
            }

            // カンマ
            if (
                char === "," &&
                !inJapaneseQuote &&
                !inDoubleQuote &&
                !inSingleQuote &&
                depth === 0
            ) {
                if (current.trim() !== "") {
                    result.push(
                        current.trim()
                    );
                }

                current = "";
                continue;
            }

            current += char;
        }

        if (current.trim() !== "") {
            result.push(
                current.trim()
            );
        }

        return result;
    }

    // ========================================
    // 正規表現用エスケープ
    // ========================================

    escapeRegExp(text) {
        return String(text).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }
}