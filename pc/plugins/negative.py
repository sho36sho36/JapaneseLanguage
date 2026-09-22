import re
from core.plugin import Plugin


class NegativePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'負数か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) < 0)"