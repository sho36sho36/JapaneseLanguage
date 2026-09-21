const vscode = require("vscode");

/*
 * Japanese Language
 * 入力補完機能 v2.2.1
 *
 * 追加機能:
 * 数値・文字列・判定・変換などを補完候補に対応
 */

const commands = [
    // ==============================
    // 基本
    // ==============================

    {
        label: "表示する",
        readings: ["ひょうじ", "ひょう", "表示"],
        detail: "文字列や値を表示します",
        snippet: "表示する「${1:表示内容}」"
    },

    {
        label: "入力する",
        readings: ["にゅうりょく", "にゅう", "入力"],
        detail: "ユーザーから入力を受け取ります",
        snippet: "入力する「${1:変数名}」"
    },

    {
        label: "変数「名前」に入れる",
        readings: ["へんすう", "変数"],
        detail: "変数に値を代入します",
        snippet: "変数「${1:名前}」に入れる ${2:値}"
    },

    {
        label: "計算する",
        readings: ["けいさん", "けい", "計算"],
        detail: "計算結果を表示します",
        snippet: "計算する ${1:式}"
    },

    {
        label: "待つ",
        readings: ["まつ", "まっ", "待つ"],
        detail: "指定した秒数だけ待機します",
        snippet: "待つ ${1:秒数}"
    },

    // ==============================
    // 制御構文
    // ==============================

    {
        label: "もし",
        readings: ["もし"],
        detail: "条件分岐を作成します",
        snippet:
            "もし ${1:条件}\n" +
            "\n" +
            "    ${2:処理}\n" +
            "\n" +
            "終わり"
    },

    {
        label: "それ以外",
        readings: ["それいがい", "それ以外"],
        detail: "条件分岐のそれ以外を作成します",
        snippet:
            "それ以外\n" +
            "\n" +
            "    ${1:処理}"
    },

    {
        label: "終わり",
        readings: ["おわり", "おわ"],
        detail: "ブロックを終了します",
        snippet: "終わり"
    },

    {
        label: "繰り返す",
        readings: ["くりかえす", "くりかえ", "繰り返す"],
        detail: "指定回数の繰り返しを作成します",
        snippet:
            "繰り返す ${1:5}回\n" +
            "\n" +
            "    ${2:処理}\n" +
            "\n" +
            "終わり"
    },

    {
        label: "抜ける",
        readings: ["ぬける", "ぬけ", "抜ける"],
        detail: "現在の繰り返しを終了します",
        snippet: "抜ける"
    },

    // ==============================
    // 数値操作
    // ==============================

    {
        label: "増やす",
        readings: ["ふやす", "ふや", "増やす"],
        detail: "変数の値を増やします",
        snippet: "増やす ${1:変数} ${2:数値}"
    },

    {
        label: "減らす",
        readings: ["へらす", "へら", "減らす"],
        detail: "変数の値を減らします",
        snippet: "減らす ${1:変数} ${2:数値}"
    },

    {
        label: "掛ける",
        readings: ["かける", "かけ", "掛ける"],
        detail: "変数に数値を掛けます",
        snippet: "掛ける ${1:変数} ${2:数値}"
    },

    {
        label: "割る",
        readings: ["わる", "割る"],
        detail: "変数を数値で割ります",
        snippet: "割る ${1:変数} ${2:数値}"
    },

    {
        label: "余り",
        readings: ["あまり", "余り"],
        detail: "割り算の余りを求めます",
        snippet: "余り ${1:変数} ${2:数値}"
    },

    {
        label: "最大",
        readings: ["さいだい", "最大"],
        detail: "最大値を求めます",
        snippet: "最大 ${1:10}, ${2:20}, ${3:30}"
    },

    {
        label: "最小",
        readings: ["さいしょう", "最小"],
        detail: "最小値を求めます",
        snippet: "最小 ${1:10}, ${2:20}, ${3:30}"
    },

    {
        label: "絶対値",
        readings: ["ぜったいち", "ぜったい", "絶対値"],
        detail: "絶対値を求めます",
        snippet: "絶対値 ${1:-100}"
    },

    {
        label: "四捨五入",
        readings: ["ししゃごにゅう", "ししゃ", "四捨五入"],
        detail: "数値を四捨五入します",
        snippet: "四捨五入 ${1:3.14}"
    },

    {
        label: "平均",
        readings: ["へいきん", "平均"],
        detail: "数値の平均を求めます",
        snippet: "平均 ${1:10}, ${2:20}, ${3:30}"
    },

    {
        label: "合計",
        readings: ["ごうけい", "合計"],
        detail: "数値の合計を求めます",
        snippet: "合計 ${1:10}, ${2:20}, ${3:30}"
    },

    {
        label: "範囲",
        readings: ["はんい", "範囲"],
        detail: "数値の範囲を求めます",
        snippet: "範囲 ${1:10}, ${2:20}, ${3:30}"
    },

    {
        label: "平方根",
        readings: ["へいほうこん", "平方根"],
        detail: "平方根を求めます",
        snippet: "平方根 ${1:16}"
    },

    {
        label: "べき乗",
        readings: ["べきじょう", "べき", "べき乗"],
        detail: "べき乗を計算します",
        snippet: "べき乗 ${1:2} ${2:3}"
    },

    {
        label: "切り捨て",
        readings: ["きりすて", "切り捨て"],
        detail: "小数部分を切り捨てます",
        snippet: "切り捨て ${1:3.14}"
    },

    {
        label: "切り上げ",
        readings: ["きりあげ", "切り上げ"],
        detail: "小数部分を切り上げます",
        snippet: "切り上げ ${1:3.14}"
    },

    {
        label: "乱数",
        readings: ["らんすう", "乱数"],
        detail: "指定範囲の乱数を生成します",
        snippet: "乱数 ${1:1} ${2:100}"
    },

    {
        label: "最大公約数",
        readings: ["さいだいこうやくすう", "最大公約数"],
        detail: "最大公約数を求めます",
        snippet: "最大公約数 ${1:12} ${2:18}"
    },

    {
        label: "最小公倍数",
        readings: ["さいしょうこうばいすう", "最小公倍数"],
        detail: "最小公倍数を求めます",
        snippet: "最小公倍数 ${1:4} ${2:6}"
    },

    {
        label: "素数か",
        readings: ["そすうか", "素数"],
        detail: "数値が素数か判定します",
        snippet: "素数か ${1:17}"
    },

    {
        label: "階乗",
        readings: ["かいじょう", "階乗"],
        detail: "階乗を求めます",
        snippet: "階乗 ${1:5}"
    },

    {
        label: "符号",
        readings: ["ふごう", "符号"],
        detail: "数値の符号を取得します",
        snippet: "符号 ${1:-10}"
    },

    {
        label: "数値を反転",
        readings: ["すうちをはんてん", "数値を反転"],
        detail: "数値の符号を反転します",
        snippet: "数値を反転 ${1:10}"
    },

    {
        label: "数値を2進数にする",
        readings: ["すうちをにしんすうにする", "2進数"],
        detail: "数値を2進数に変換します",
        snippet: "数値を2進数にする ${1:10}"
    },

    {
        label: "数値を16進数にする",
        readings: ["すうちをじゅうろくしんすうにする", "16進数"],
        detail: "数値を16進数に変換します",
        snippet: "数値を16進数にする ${1:255}"
    },

    {
        label: "2進数を数字にする",
        readings: ["にしんすうをすうじにする", "2進数を数字にする"],
        detail: "2進数を数字に変換します",
        snippet: "2進数を数字にする「${1:1010}」"
    },

    {
        label: "16進数を数字にする",
        readings: ["じゅうろくしんすうをすうじにする", "16進数を数字にする"],
        detail: "16進数を数字に変換します",
        snippet: "16進数を数字にする「${1:FF}」"
    },

    {
        label: "数値の範囲内か",
        readings: ["すうちのはんいないか", "範囲内"],
        detail: "数値が指定範囲内か判定します",
        snippet: "数値の範囲内か ${1:10} ${2:1} ${3:20}"
    },

    {
        label: "正負を反転",
        readings: ["せいふをはんてん", "正負を反転"],
        detail: "数値の正負を反転します",
        snippet: "正負を反転 ${1:10}"
    },

    {
        label: "小数部分",
        readings: ["しょうすうぶぶん", "小数部分"],
        detail: "数値の小数部分を取得します",
        snippet: "小数部分 ${1:3.14}"
    },

    {
        label: "整数部分",
        readings: ["せいすうぶぶん", "整数部分"],
        detail: "数値の整数部分を取得します",
        snippet: "整数部分 ${1:3.14}"
    },

    // ==============================
    // 数値判定
    // ==============================

    {
        label: "偶数か",
        readings: ["ぐうすうか", "偶数"],
        detail: "数値が偶数か判定します",
        snippet: "偶数か ${1:10}"
    },

    {
        label: "奇数か",
        readings: ["きすうか", "奇数"],
        detail: "数値が奇数か判定します",
        snippet: "奇数か ${1:11}"
    },

    {
        label: "正数か",
        readings: ["せいすうか", "正数"],
        detail: "数値が正数か判定します",
        snippet: "正数か ${1:10}"
    },

    {
        label: "負数か",
        readings: ["ふすうか", "負数"],
        detail: "数値が負数か判定します",
        snippet: "負数か ${1:-10}"
    },

    {
        label: "0か",
        readings: ["ぜろか", "0か"],
        detail: "値が0か判定します",
        snippet: "0か ${1:0}"
    },

    // ==============================
    // 文字列
    // ==============================

    {
        label: "文字にする",
        readings: ["もじにする", "もじ", "文字"],
        detail: "値を文字列に変換します",
        snippet: "文字にする ${1:値}"
    },

    {
        label: "文字列の長さ",
        readings: ["もじれつのながさ", "文字列の長さ"],
        detail: "文字列の長さを取得します",
        snippet: "文字列の長さ「${1:文字列}」"
    },

    {
        label: "文字を探す",
        readings: ["もじをさがす", "文字を探す"],
        detail: "文字列から文字を探します",
        snippet: "文字を探す「${1:文字列}」「${2:検索文字}」"
    },

    {
        label: "文字を置き換える",
        readings: ["もじをおきかえる", "文字を置き換える"],
        detail: "文字列の一部を置き換えます",
        snippet:
            "文字を置き換える「${1:文字列}」「${2:検索文字}」「${3:置換文字}」"
    },

    {
        label: "文字を切り出す",
        readings: ["もじをきりだす", "文字を切り出す"],
        detail: "文字列の一部を切り出します",
        snippet: "文字を切り出す「${1:文字列}」 ${2:0} ${3:3}"
    },

    {
        label: "空白を消す",
        readings: ["くうはくをけす", "空白を消す"],
        detail: "文字列の前後の空白を削除します",
        snippet: "空白を消す「${1: 文字列 }」"
    },

    {
        label: "文字が含まれる",
        readings: ["もじがふくまれる", "含まれる"],
        detail: "文字列に指定文字が含まれるか判定します",
        snippet: "文字が含まれる「${1:文字列}」「${2:検索文字}」"
    },

    {
        label: "文字を反転",
        readings: ["もじをはんてん", "文字を反転"],
        detail: "文字列を反転します",
        snippet: "文字を反転「${1:こんにちは}」"
    },

    {
        label: "文字の先頭",
        readings: ["もじのせんとう", "文字の先頭"],
        detail: "文字列の先頭の文字を取得します",
        snippet: "文字の先頭「${1:こんにちは}」"
    },

    {
        label: "文字の末尾",
        readings: ["もじのまつび", "文字の末尾"],
        detail: "文字列の末尾の文字を取得します",
        snippet: "文字の末尾「${1:こんにちは}」"
    },

    {
        label: "文字が数字か",
        readings: ["もじがすうじか", "文字が数字か"],
        detail: "文字列が数字か判定します",
        snippet: "文字が数字か「${1:123}」"
    },

    {
        label: "文字が空か",
        readings: ["もじがからか", "文字が空か"],
        detail: "文字列が空か判定します",
        snippet: "文字が空か「${1:}」"
    },

    // ==============================
    // 型変換
    // ==============================

    {
        label: "数字にする",
        readings: ["すうじにする", "すうじ", "数字"],
        detail: "値を数字に変換します",
        snippet: "数字にする「${1:123}」"
    },

    {
        label: "数値を2進数にする",
        readings: ["すうちをにしんすうにする", "2進数"],
        detail: "数値を2進数に変換します",
        snippet: "数値を2進数にする ${1:10}"
    },

    {
        label: "数値を16進数にする",
        readings: ["すうちをじゅうろくしんすうにする", "16進数"],
        detail: "数値を16進数に変換します",
        snippet: "数値を16進数にする ${1:255}"
    },

    {
        label: "2進数を数字にする",
        readings: ["にしんすうをすうじにする", "2進数を数字にする"],
        detail: "2進数を数字に変換します",
        snippet: "2進数を数字にする「${1:1010}」"
    },

    {
        label: "16進数を数字にする",
        readings: ["じゅうろくしんすうをすうじにする", "16進数を数字にする"],
        detail: "16進数を数字に変換します",
        snippet: "16進数を数字にする「${1:FF}」"
    },

    // ==============================
    // リスト
    // ==============================

    {
        label: "リスト「名前」を作る",
        readings: ["りすと", "リスト"],
        detail: "リストを作成します",
        snippet: "リスト「${1:名前}」を作る"
    },

    {
        label: "リストに追加する",
        readings: ["りすとついか", "りすとに", "追加"],
        detail: "リストに値を追加します",
        snippet:
            "リスト「${1:名前}」に「${2:値}」を追加する"
    },

    {
        label: "リストから削除する",
        readings: ["りすとさくじょ", "りすとから", "削除"],
        detail: "リストから値を削除します",
        snippet:
            "リスト「${1:名前}」から「${2:値}」を削除する"
    },

    {
        label: "リストから取り出す",
        readings: ["りすとからとりだす", "とりだす", "取り出す"],
        detail: "リストから値を取り出します",
        snippet:
            "リスト「${1:名前}」から取り出す ${2:0}"
    },

    {
        label: "リストの長さ",
        readings: ["りすとのながさ", "りすとの", "長さ"],
        detail: "リストの長さを取得します",
        snippet:
            "リスト「${1:名前}」の長さ"
    },

    // ==============================
    // その他
    // ==============================

    {
        label: "存在する",
        readings: ["そんざいする", "そんざい", "存在"],
        detail: "変数などが存在するか確認します",
        snippet: "存在する ${1:変数}"
    }
];


/*
 * 入力文字から現在の単語を取得
 */
function getCurrentWord(document, position) {

    const line =
        document.lineAt(position.line).text;

    let start =
        position.character;

    while (start > 0) {

        const char =
            line[start - 1];

        if (
            char === " " ||
            char === "\t" ||
            char === "　"
        ) {
            break;
        }

        start--;
    }

    return {
        text: line.substring(
            start,
            position.character
        ),
        start
    };
}


/*
 * ひらがな・カタカナを比較しやすくする
 */
function normalize(text) {

    return text
        .trim()
        .toLowerCase()
        .replace(
            /[ぁ-ん]/g,
            char =>
                String.fromCharCode(
                    char.charCodeAt(0) + 0x60
                )
        );
}


/*
 * 補完候補を作成
 */
function createCompletionItem(
    command,
    document,
    position,
    start
) {

    const item =
        new vscode.CompletionItem(
            command.label,
            vscode.CompletionItemKind.Keyword
        );

    item.detail =
        command.detail;

    item.documentation =
        new vscode.MarkdownString(
            `**${command.label}**\n\n${command.detail}`
        );

    item.insertText =
        new vscode.SnippetString(
            command.snippet
        );

    item.range =
        new vscode.Range(
            new vscode.Position(
                position.line,
                start
            ),
            position
        );

    item.filterText =
        command.label +
        " " +
        command.readings.join(" ");

    return item;
}


/*
 * 拡張機能を有効化
 */
function activate(context) {

    const provider =
        vscode.languages.registerCompletionItemProvider(
            "japanese",

            {

                provideCompletionItems(
                    document,
                    position
                ) {

                    const current =
                        getCurrentWord(
                            document,
                            position
                        );

                    const input =
                        normalize(
                            current.text
                        );

                    /*
                     * 入力がない場合は
                     * 全候補を表示
                     */
                    if (!input) {

                        return commands.map(
                            command =>
                                createCompletionItem(
                                    command,
                                    document,
                                    position,
                                    current.start
                                )
                        );
                    }

                    const results = [];

                    for (
                        const command
                        of commands
                    ) {

                        const label =
                            normalize(
                                command.label
                            );

                        const readings =
                            command.readings
                                .map(normalize);

                        let matched = false;

                        /*
                         * コマンド名
                         */
                        if (
                            label.startsWith(input)
                        ) {
                            matched = true;
                        }

                        /*
                         * 読み仮名
                         */
                        if (
                            !matched &&
                            readings.some(
                                reading =>
                                    reading.startsWith(
                                        input
                                    )
                            )
                        ) {
                            matched = true;
                        }

                        /*
                         * コマンド名の途中
                         */
                        if (
                            !matched &&
                            label.includes(input)
                        ) {
                            matched = true;
                        }

                        if (matched) {

                            results.push(
                                createCompletionItem(
                                    command,
                                    document,
                                    position,
                                    current.start
                                )
                            );
                        }
                    }

                    return results;
                }
            },

            " ",
            "　"
        );

    context.subscriptions.push(
        provider
    );
}


function deactivate() {}


module.exports = {
    activate,
    deactivate
};