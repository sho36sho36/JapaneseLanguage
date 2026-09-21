const vscode = require("vscode");

/*
 * Japanese Language
 * 入力補完機能 v2.2.0
 */

const commands = [
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
        label: "数字にする",
        readings: ["すうじにする", "すうじ", "数字"],
        detail: "値を数字に変換します",
        snippet: "数字にする「${1:文字列}」"
    },

    {
        label: "文字にする",
        readings: ["もじにする", "もじ", "文字"],
        detail: "値を文字列に変換します",
        snippet: "文字にする ${1:値}"
    },

    {
        label: "文字をつなぐ",
        readings: ["もじをつなぐ", "もじを", "つなぐ"],
        detail: "2つの文字列をつなぎます",
        snippet: "文字をつなぐ「${1:文字列1}」「${2:文字列2}」"
    },

    {
        label: "大文字にする",
        readings: ["おおもじにする", "おおもじ", "大文字"],
        detail: "文字列を大文字にします",
        snippet: "大文字にする「${1:文字列}」"
    },

    {
        label: "小文字にする",
        readings: ["こもじにする", "こもじ", "小文字"],
        detail: "文字列を小文字にします",
        snippet: "小文字にする「${1:文字列}」"
    },

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
    const line = document.lineAt(position.line).text;

    let start = position.character;

    while (start > 0) {
        const char = line[start - 1];

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
        text: line.substring(start, position.character),
        start
    };
}


/*
 * ひらがな・カタカナ・漢字を比較しやすくする
 */
function normalize(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[ぁ-ん]/g, char =>
            String.fromCharCode(char.charCodeAt(0) + 0x60)
        );
}


/*
 * 補完候補を登録
 */
function activate(context) {

    const provider =
        vscode.languages.registerCompletionItemProvider(
            "japanese",

            {
                provideCompletionItems(document, position) {

                    const current =
                        getCurrentWord(document, position);

                    const input =
                        normalize(current.text);

                    /*
                     * 何も入力していない場合も
                     * コマンド一覧を表示
                     */
                    if (!input) {
                        return commands.map(command =>
                            createCompletionItem(
                                command,
                                current.start,
                                position.character
                            )
                        );
                    }

                    const results = [];

                    for (const command of commands) {

                        const label =
                            normalize(command.label);

                        const readings =
                            command.readings.map(normalize);

                        let matched = false;

                        /*
                         * コマンド本体
                         */
                        if (label.startsWith(input)) {
                            matched = true;
                        }

                        /*
                         * 読み仮名
                         */
                        if (
                            !matched &&
                            readings.some(reading =>
                                reading.startsWith(input)
                            )
                        ) {
                            matched = true;
                        }

                        /*
                         * 入力文字がコマンド内に
                         * 含まれている場合
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
                                    current.start,
                                    position.character
                                )
                            );
                        }
                    }

                    return results;
                }
            },

            /*
             * 日本語入力中でも呼び出す
             */
            " ",
            "　"
        );

    context.subscriptions.push(provider);
}


/*
 * CompletionItemを作成
 */
function createCompletionItem(
    command,
    start,
    end
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
                0,
                0
            ),
            new vscode.Position(
                0,
                0
            )
        );

    /*
     * 現在入力中の文字を置き換える
     */
    item.range =
        new vscode.Range(
            new vscode.Position(
                item.range.start.line,
                start
            ),
            new vscode.Position(
                item.range.end.line,
                end
            )
        );

    /*
     * 日本語入力中でも候補として扱いやすくする
     */
    item.filterText =
        command.label + " " +
        command.readings.join(" ");

    return item;
}


function deactivate() {}

module.exports = {
    activate,
    deactivate
};