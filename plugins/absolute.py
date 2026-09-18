import re
from plugin import Plugin


class AbsolutePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'絶対値\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return f"print(abs({value}))"