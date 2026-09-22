import re
from core.plugin import Plugin


class BinaryToNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'2進数を数字にする\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(int({value!r}, 2))"