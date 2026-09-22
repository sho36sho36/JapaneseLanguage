import re
from core.plugin import Plugin


class IsNumberPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字が数字か\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print({value!r}.isdigit())"