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


class Engine:

    def __init__(self):

        self.version = "2.0.0"

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

    def run_file(self, filename):

        path = Path(filename)

        source = path.read_text(
            encoding="utf-8"
        )

        self.run(source, str(path))

    def run(self, source, filename="<memory>"):

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

    def translate(self, source, filename):

        result = []
        indent = 0
        block_stack = []

        for line_number, line in enumerate(
            source.splitlines(),
            start=1
        ):

            line = line.strip()

            if not line:
                continue

            if line.startswith("//"):
                continue

            translated = self.plugins.translate(line)

            if translated is None:
                raise SyntaxError(
                    f"{filename}:{line_number}: "
                    f"理解できない命令です: {line}"
                )

            if isinstance(translated, str):

                result.append(
                    "    " * indent + translated
                )

                continue

            if isinstance(translated, BlockCommand):

                if translated.action == "start":

                    result.append(
                        "    " * indent
                        + translated.code
                    )

                    indent += 1

                    block_stack.append(
                        translated.block_type
                    )

                    continue

                if translated.action == "else":

                    if not block_stack:
                        raise SyntaxError(
                            f"{filename}:{line_number}: "
                            "「それ以外」の対応する「もし」がありません。"
                        )

                    if block_stack[-1] != "if":
                        raise SyntaxError(
                            f"{filename}:{line_number}: "
                            "「それ以外」は「もし」の中で使用してください。"
                        )

                    indent -= 1

                    result.append(
                        "    " * indent + "else:"
                    )

                    indent += 1

                    continue

                if translated.action == "end":

                    if not block_stack:
                        raise SyntaxError(
                            f"{filename}:{line_number}: "
                            "対応するブロックがありません。"
                        )

                    indent -= 1
                    block_stack.pop()

                    continue

                if translated.action == "break":

                    if "loop" not in block_stack:
                        raise SyntaxError(
                            f"{filename}:{line_number}: "
                            "「抜ける」は「繰り返す」の中で使用してください。"
                        )

                    result.append(
                        "    " * indent + "break"
                    )

                    continue

        if block_stack:

            raise SyntaxError(
                f"{filename}: "
                "ブロックが「終わり」で閉じられていません。"
            )

        return "\n".join(result)

    def execute(self, python_code, filename):

        python_code = "import time\n" + python_code

        compiled = compile(
            python_code,
            filename,
            "exec"
        )

        namespace = {
            "__name__": "__main__",
            "__file__": filename
        }

        exec(
            compiled,
            namespace
        )