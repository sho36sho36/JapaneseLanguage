import re
from core.plugin import Plugin


class AveragePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'平均\s+(.+)', line)
        if not match:
            return None

        values = match.group(1)
        return f"print(sum([{values}]) / len([{values}]))"