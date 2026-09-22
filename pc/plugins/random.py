import re
from core.plugin import Plugin


class RandomPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'乱数\s+(.+)\s+(.+)', line)
        if not match:
            return None

        minimum = match.group(1)
        maximum = match.group(2)

        return f"print(__import__('random').randint({minimum}, {maximum}))"