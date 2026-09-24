import re
from core.plugin import Plugin


class MaximumPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'最大\s+(.+)', line)

        if not match:
            return None

        values = match.group(1).strip()
        values = re.sub(r'\s+', ', ', values)

        return f"print(max({values}))"