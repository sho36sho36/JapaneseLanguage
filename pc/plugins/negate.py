import re
from core.plugin import Plugin


class NegatePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'数値を反転\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(-({value}))"