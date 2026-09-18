import re
from plugin import Plugin


class CalculatePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'計算する\s+(.+)',
            line
        )

        if not match:
            return None

        expression = match.group(1)

        return f"print({expression})"