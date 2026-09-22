import re
from core.plugin import Plugin


class StringFindPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字を探す\s+「(.+)」\s+「(.+)」', line)
        if not match:
            return None

        text = match.group(1)
        search = match.group(2)

        return f"print({text!r}.find({search!r}))"