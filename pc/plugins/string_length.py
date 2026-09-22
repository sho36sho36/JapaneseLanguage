import re
from core.plugin import Plugin


class StringLengthPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字の長さ\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(len({value!r}))"