import re
from core.plugin import Plugin


class BinaryPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'数値を2進数にする\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(bin(int({value}))[2:])"