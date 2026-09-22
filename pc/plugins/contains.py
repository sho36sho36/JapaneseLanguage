import re
from core.plugin import Plugin


class ContainsPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字が含まれる\s+「(.+)」\s+「(.+)」', line)
        if not match:
            return None

        text = match.group(1)
        search = match.group(2)

        return f"print({search!r} in {text!r})"