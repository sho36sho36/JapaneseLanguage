import re
from core.plugin import Plugin


class SumPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'合計\s+(.+)', line)
        if not match:
            return None

        values = match.group(1)
        return f"print(sum([{values}]))"