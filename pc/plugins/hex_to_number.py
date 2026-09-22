import re
from core.plugin import Plugin


class HexToNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'16進数を数字にする\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(int({value!r}, 16))"