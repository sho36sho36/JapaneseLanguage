import re
from core.plugin import Plugin


class FactorialPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'階乗\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)
        return f"print(__import__('math').factorial({value}))"