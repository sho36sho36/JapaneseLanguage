import re
from core.plugin import Plugin


class LcmPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'最小公倍数\s+(.+)\s+(.+)', line)
        if not match:
            return None

        a = match.group(1)
        b = match.group(2)

        return f"print(__import__('math').lcm({a}, {b}))"