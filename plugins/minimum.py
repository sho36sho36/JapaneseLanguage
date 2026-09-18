import re
from plugin import Plugin


class MinimumPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'最小\s+(.+)', line)

        if not match:
            return None

        values = match.group(1)

        return f"print(min({values}))"