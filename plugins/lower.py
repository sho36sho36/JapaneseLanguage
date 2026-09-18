import re
from plugin import Plugin


class LowerPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'小文字にする\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"str({value}).lower()"