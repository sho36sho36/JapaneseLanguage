import re
from core.plugin import Plugin


class OddPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'奇数か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) % 2 != 0)"