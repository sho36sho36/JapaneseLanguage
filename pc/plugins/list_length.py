import re
from core.plugin import Plugin


class ListLengthPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'リスト「([^」]+)」の長さ',
            line
        )

        if not match:
            return None

        name = match.group(1)

        return f"print(len({name}))"