import re
from core.plugin import Plugin


class PositivePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'正数か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) > 0)"