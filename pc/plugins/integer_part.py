import re
from core.plugin import Plugin


class IntegerPartPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'整数部分\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(int({value}))"