import re
from core.plugin import Plugin


class ListGetPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'リスト「([^」]+)」から取り出す\s+(.+)',
            line
        )

        if not match:
            return None

        name = match.group(1)
        index = match.group(2)

        return f"print({name}[int({index})])"