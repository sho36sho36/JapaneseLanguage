import re
from core.plugin import Plugin


class DisplayPlugin(Plugin):
    def translate(self, line):

        # 表示する「こんにちは」
        match = re.fullmatch(
            r'表示する「(.*)」',
            line
        )

        if match:
            text = match.group(1)
            return f"print({text!r})"

        # 表示する 名前
        match = re.fullmatch(
            r'表示する\s+(.+)',
            line
        )

        if match:
            value = match.group(1)
            return f"print({value})"

        return None