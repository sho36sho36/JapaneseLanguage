import re
from core.plugin import Plugin


class FloorPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'切り捨て\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(int({value}))"