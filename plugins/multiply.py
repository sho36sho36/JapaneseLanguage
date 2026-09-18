import re
from plugin import Plugin


class MultiplyPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'掛ける\s+(.+?)\s+(.+)', line)

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        return f"{name} *= {value}"