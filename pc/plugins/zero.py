import re
from core.plugin import Plugin


class ZeroPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'0か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) == 0)"