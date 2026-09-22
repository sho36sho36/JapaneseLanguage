import re
from core.plugin import Plugin


class StripPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'空白を消す\s+「(.+)」', line)
        if not match:
            return None

        value = match.group(1)
        return f"print({value!r}.strip())"