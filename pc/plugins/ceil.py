import re
from core.plugin import Plugin


class CeilPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'切り上げ\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(__import__('math').ceil({value}))"