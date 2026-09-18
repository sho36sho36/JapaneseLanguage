import re
from plugin import Plugin


class ConcatPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'文字をつなぐ\s+(.+?)\s+(.+)',
            line
        )

        if not match:
            return None

        left = match.group(1)
        right = match.group(2)

        return f"str({left}) + str({right})"