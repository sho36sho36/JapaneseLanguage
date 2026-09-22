import re
from core.plugin import Plugin


class ReverseNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'正負を反転\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(-({value}))"