import re
from core.plugin import Plugin


class ReverseStringPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字を反転\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print({value!r}[::-1])"