import re
from plugin import Plugin


class MaximumPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'最大\s+(.+)', line)

        if not match:
            return None

        values = match.group(1)

        return f"print(max({values}))"