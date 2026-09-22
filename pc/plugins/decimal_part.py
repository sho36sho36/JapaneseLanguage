import re
from core.plugin import Plugin


class DecimalPartPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'小数部分\s+(.+)', line)

        if not match:
            return None

        value = match.group(1)

        return (
            f"print(round("
            f"({value}) - int({value}), "
            f"12"
            f"))"
        )