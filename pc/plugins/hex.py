import re
from core.plugin import Plugin


class HexPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'数値を16進数にする\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(hex(int({value}))[2:])"