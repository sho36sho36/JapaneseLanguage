import re
from core.plugin import Plugin


class VariablePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'変数「([^」]+)」に入れる\s*(.+)',
            line
        )

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        # 「文字」→ "文字"
        if value.startswith("「") and value.endswith("」"):
            value = repr(value[1:-1])

        return f"{name} = {value}"