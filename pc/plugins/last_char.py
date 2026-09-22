import re
from core.plugin import Plugin


class LastCharPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字の末尾\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print({value!r}[-1] if {value!r} else '')"