import re
from core.plugin import Plugin


class UpperPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'大文字にする\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"str({value}).upper()"