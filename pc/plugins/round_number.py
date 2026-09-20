import re
from core.plugin import Plugin


class RoundNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'四捨五入\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"print(round({value}))"