import re
from core.plugin import Plugin


class StringReplacePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字を置き換える\s+「(.+)」\s+「(.+)」\s+「(.+)」', line)
        if not match:
            return None

        text = match.group(1)
        old = match.group(2)
        new = match.group(3)

        return f"print({text!r}.replace({old!r}, {new!r}))"