import re
from core.plugin import Plugin


class RemainderPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'余り\s+(.+?)\s+(.+)', line)

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        return f"{name} %= {value}"