import re
from core.plugin import Plugin


class ToStringPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字にする\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"str({value})"