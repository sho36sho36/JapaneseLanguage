import re
from core.plugin import Plugin


class GcdPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'最大公約数\s+(.+)\s+(.+)', line)
        if not match:
            return None

        a = match.group(1)
        b = match.group(2)

        return f"print(__import__('math').gcd({a}, {b}))"