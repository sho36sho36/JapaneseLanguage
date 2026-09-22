import re
from core.plugin import Plugin


class SignPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'符号\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)

        return f"print(1 if ({value}) > 0 else (-1 if ({value}) < 0 else 0))"