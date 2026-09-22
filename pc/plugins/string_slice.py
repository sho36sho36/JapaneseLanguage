import re
from core.plugin import Plugin


class StringSlicePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字を切り出す\s+「(.+)」\s+(.+)\s+(.+)', line)
        if not match:
            return None

        text = match.group(1)
        start = match.group(2)
        end = match.group(3)

        return f"print({text!r}[{start}:{end}])"