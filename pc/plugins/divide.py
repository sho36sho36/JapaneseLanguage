import re
from core.plugin import Plugin


class DividePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'割る\s+(.+?)\s+(.+)', line)

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        return f"{name} /= {value}"