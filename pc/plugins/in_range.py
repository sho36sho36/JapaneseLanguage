import re
from core.plugin import Plugin


class InRangePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'数値の範囲内か\s+(.+)\s+(.+)\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        minimum = match.group(2)
        maximum = match.group(3)

        return f"print(({minimum}) <= ({value}) <= ({maximum}))"