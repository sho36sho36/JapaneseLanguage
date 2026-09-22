import re
from core.plugin import Plugin


class PowerPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'べき乗\s+(.+)\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        exponent = match.group(2)

        return f"print(({value}) ** ({exponent}))"