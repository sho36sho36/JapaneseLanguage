from pathlib import Path

from core.plugin import PluginManager, BlockCommand

from pc.plugins.display import DisplayPlugin
from pc.plugins.variable import VariablePlugin
from pc.plugins.input import InputPlugin
from pc.plugins.calculate import CalculatePlugin
from pc.plugins.wait import WaitPlugin

from pc.plugins.if_plugin import IfPlugin
from pc.plugins.else_plugin import ElsePlugin
from pc.plugins.end import EndPlugin
from pc.plugins.repeat import RepeatPlugin
from pc.plugins.break_plugin import BreakPlugin

from pc.plugins.increase import IncreasePlugin
from pc.plugins.decrease import DecreasePlugin
from pc.plugins.multiply import MultiplyPlugin
from pc.plugins.divide import DividePlugin
from pc.plugins.remainder import RemainderPlugin
from pc.plugins.to_number import ToNumberPlugin
from pc.plugins.to_string import ToStringPlugin
from pc.plugins.concat import ConcatPlugin
from pc.plugins.upper import UpperPlugin
from pc.plugins.lower import LowerPlugin

from pc.plugins.list_create import ListCreatePlugin
from pc.plugins.list_add import ListAddPlugin
from pc.plugins.list_remove import ListRemovePlugin
from pc.plugins.list_get import ListGetPlugin
from pc.plugins.list_length import ListLengthPlugin

from pc.plugins.maximum import MaximumPlugin
from pc.plugins.minimum import MinimumPlugin
from pc.plugins.absolute import AbsolutePlugin
from pc.plugins.round_number import RoundNumberPlugin
from pc.plugins.exists import ExistsPlugin


class JapaneseLanguageError(Exception):
    """自作言語用のエラー"""

    def __init__(self, message, filename=None, line_number=None, cause=None):
        self.message = message
        self.filename = filename
        self.line_number = line_number
        self.cause = cause

        text = ""

        if filename:
            text += f"ファイル: {filename}\n"

        if line_number is not None:
            text += f"行番号: {line_number}\n"

        text += f"エラー: {message}"

        if cause:
            text += f"\n原因: {cause}"

        super().__init__(text)


class Engine:

    def __init__(self):

        self.version = "2.1.0"

        self.plugins = PluginManager()

        # 第1弾
        self.plugins.register(DisplayPlugin())
        self.plugins.register(VariablePlugin())
        self.plugins.register(InputPlugin())
        self.plugins.register(CalculatePlugin())
        self.plugins.register(WaitPlugin())

        # 第2弾
        self.plugins.register(IfPlugin())
        self.plugins.register(ElsePlugin())
        self.plugins.register(EndPlugin())
        self.plugins.register(RepeatPlugin())
        self.plugins.register(BreakPlugin())

        # 第3弾
        self.plugins.register(IncreasePlugin())
        self.plugins.register(DecreasePlugin())
        self.plugins.register(MultiplyPlugin())
        self.plugins.register(DividePlugin())
        self.plugins.register(RemainderPlugin())

        self.plugins.register(ToNumberPlugin())
        self.plugins.register(ToStringPlugin())
        self.plugins.register(ConcatPlugin())
        self.plugins.register(UpperPlugin())
        self.plugins.register(LowerPlugin())

        self.plugins.register(ListCreatePlugin())
        self.plugins.register(ListAddPlugin())
        self.plugins.register(ListRemovePlugin())
        self.plugins.register(ListGetPlugin())
        self.plugins.register(ListLengthPlugin())

        self.plugins.register(MaximumPlugin())
        self.plugins.register(MinimumPlugin())
        self.plugins.register(AbsolutePlugin())
        self.plugins.register(RoundNumberPlugin())
        self.plugins.register(ExistsPlugin())

    # ============================================================
    # ファイル実行
    # ============================================================

    def run_file(self, filename):

        path = Path(filename)

        try:
            source = path.read_text(
                encoding="utf-8"
            )
        except UnicodeDecodeError:
            raise JapaneseLanguageError(
                "ファイルをUTF-8として読み込めません。",
                filename=str(path),
                cause="ファイルの文字コードをUTF-8にしてください。"
            )

        self.run(source, str(path))

    # ============================================================
    # 実行
    # ============================================================

    def run(self, source, filename="<memory>"):

        try:
            python_code = self.translate(
                source,
                filename
            )

            if not python_code.strip():
                return

            print("=== Pythonへ変換 ===")
            print(python_code)
            print("====================")

            self.execute(
                python_code,
                filename
            )

        except JapaneseLanguageError:
            raise

        except SyntaxError as error:
            raise JapaneseLanguageError(
                "生成されたPythonコードに構文エラーがあります。",
                filename=filename,
                cause=str(error)
            )

        except NameError as error:
            raise JapaneseLanguageError(
                "存在しない変数が使用されています。",
                filename=filename,
                cause=str(error)
            )

        except (ValueError, TypeError) as error:
            raise JapaneseLanguageError(
                "値の種類が正しくありません。",
                filename=filename,
                cause=str(error)
            )

    # ============================================================
    # 翻訳
    # ============================================================

    def translate(self, source, filename):

        result = []
        indent = 0
        block_stack = []

        # 変数名を事前に記録するための集合
        defined_variables = set()

        lines = source.splitlines()

        for line_number, raw_line in enumerate(
            lines,
            start=1
        ):

            line = raw_line.strip()

            if not line:
                continue

            if line.startswith("//"):
                continue

            # ====================================================
            # 構文チェック
            # ====================================================

            if line == "終わり":

                if not block_stack:
                    raise JapaneseLanguageError(
                        "対応するブロックがありません。",
                        filename,
                        line_number,
                        "この「終わり」に対応する「もし」または「繰り返す」がありません。"
                    )

                indent -= 1
                block_stack.pop()

                continue

            if line == "それ以外":

                if not block_stack:
                    raise JapaneseLanguageError(
                        "「それ以外」の対応する「もし」がありません。",
                        filename,
                        line_number,
                        "「それ以外」は「もし」の中で使用してください。"
                    )

                if block_stack[-1]["type"] != "if":
                    raise JapaneseLanguageError(
                        "「それ以外」をここでは使用できません。",
                        filename,
                        line_number,
                        "「それ以外」は「もし」の直後のブロックで使用してください。"
                    )

                if block_stack[-1]["has_else"]:
                    raise JapaneseLanguageError(
                        "「それ以外」を複数回使用しています。",
                        filename,
                        line_number,
                        "1つの「もし」に対して「それ以外」は1回だけ使用できます。"
                    )

                block_stack[-1]["has_else"] = True

                indent -= 1

                result.append(
                    "    " * indent + "else:"
                )

                indent += 1

                continue

            # ====================================================
            # 「抜ける」
            # ====================================================

            if line == "抜ける":

                if not any(
                    block["type"] == "loop"
                    for block in block_stack
                ):
                    raise JapaneseLanguageError(
                        "「抜ける」を使用できません。",
                        filename,
                        line_number,
                        "「抜ける」は「繰り返す」の中で使用してください。"
                    )

                result.append(
                    "    " * indent + "break"
                )

                continue

            # ====================================================
            # 変数定義の検出
            # ====================================================

            if line.startswith("変数「") and "」に入れる" in line:

                start = len("変数「")
                end = line.find("」に入れる", start)

                if end > start:
                    variable_name = line[
                        start:end
                    ].strip()

                    if variable_name:
                        defined_variables.add(
                            variable_name
                        )

            # ====================================================
            # プラグインによる変換
            # ====================================================

            try:
                translated = self.plugins.translate(line)

            except Exception as error:
                raise JapaneseLanguageError(
                    "命令を処理できませんでした。",
                    filename,
                    line_number,
                    str(error)
                )

            if translated is None:

                raise JapaneseLanguageError(
                    "理解できない命令です。",
                    filename,
                    line_number,
                    f"「{line}」という命令は登録されていません。"
                )

            # ====================================================
            # 通常命令
            # ====================================================

            if isinstance(translated, str):

                result.append(
                    "    " * indent + translated
                )

                continue

            # ====================================================
            # ブロック命令
            # ====================================================

            if isinstance(translated, BlockCommand):

                if translated.action == "start":

                    block_type = translated.block_type

                    result.append(
                        "    " * indent
                        + translated.code
                    )

                    indent += 1

                    block_stack.append(
                        {
                            "type": block_type,
                            "line": line_number,
                            "command": line,
                            "has_else": False
                        }
                    )

                    continue

                if translated.action == "else":

                    if not block_stack:
                        raise JapaneseLanguageError(
                            "「それ以外」の対応する「もし」がありません。",
                            filename,
                            line_number,
                            "先に「もし」を開始してください。"
                        )

                    if block_stack[-1]["type"] != "if":
                        raise JapaneseLanguageError(
                            "「それ以外」は「もし」の中で使用してください。",
                            filename,
                            line_number
                        )

                    if block_stack[-1]["has_else"]:
                        raise JapaneseLanguageError(
                            "「それ以外」を複数回使用しています。",
                            filename,
                            line_number,
                            "1つの「もし」に対して「それ以外」は1回だけ使用できます。"
                        )

                    block_stack[-1]["has_else"] = True

                    indent -= 1

                    result.append(
                        "    " * indent + "else:"
                    )

                    indent += 1

                    continue

                if translated.action == "end":

                    if not block_stack:
                        raise JapaneseLanguageError(
                            "対応するブロックがありません。",
                            filename,
                            line_number,
                            "この「終わり」に対応する「もし」または「繰り返す」がありません。"
                        )

                    indent -= 1
                    block_stack.pop()

                    continue

                if translated.action == "break":

                    if not any(
                        block["type"] == "loop"
                        for block in block_stack
                    ):
                        raise JapaneseLanguageError(
                            "「抜ける」を使用できません。",
                            filename,
                            line_number,
                            "「抜ける」は「繰り返す」の中で使用してください。"
                        )

                    result.append(
                        "    " * indent + "break"
                    )

                    continue

        # ========================================================
        # ブロック閉じ忘れチェック
        # ========================================================

        if block_stack:

            block = block_stack[-1]

            if block["type"] == "if":
                block_name = "もし"

            elif block["type"] == "loop":
                block_name = "繰り返す"

            else:
                block_name = block["type"]

            raise JapaneseLanguageError(
                f"「{block_name}」のブロックが閉じられていません。",
                filename,
                block["line"],
                f"この「{block_name}」に対応する「終わり」を追加してください。"
            )

        return "\n".join(result)

    # ============================================================
    # Python実行
    # ============================================================

    def execute(self, python_code, filename):

        python_code = "import time\n" + python_code

        try:

            compiled = compile(
                python_code,
                filename,
                "exec"
            )

        except SyntaxError as error:

            line_number = error.lineno

            raise JapaneseLanguageError(
                "生成されたPythonコードに構文エラーがあります。",
                filename,
                line_number,
                error.msg
            )

        namespace = {
            "__name__": "__main__",
            "__file__": filename
        }

        try:

            exec(
                compiled,
                namespace
            )

        except NameError as error:

            raise JapaneseLanguageError(
                "存在しない変数が使用されています。",
                filename,
                getattr(error, "lineno", None),
                str(error)
            )

        except (ValueError, TypeError) as error:

            raise JapaneseLanguageError(
                "値の種類が正しくありません。",
                filename,
                getattr(error, "lineno", None),
                str(error)
            )