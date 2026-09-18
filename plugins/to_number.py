import re
from plugin import Plugin


class ToNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'数字にする\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"float({value})"