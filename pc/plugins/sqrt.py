import re
from core.plugin import Plugin


class SqrtPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'平方根\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(({value}) ** 0.5)"