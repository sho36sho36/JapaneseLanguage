import re
from core.plugin import Plugin


class IsEmptyPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'文字が空か\s+「(.*)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print({value!r} == '')"