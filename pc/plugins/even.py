import re
from core.plugin import Plugin


class EvenPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'偶数か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) % 2 == 0)"