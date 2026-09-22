import re
from core.plugin import Plugin


class RangePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'範囲\s+(.+)', line)
        if not match:
            return None

        values = match.group(1)
        return f"print(max([{values}]) - min([{values}]))"