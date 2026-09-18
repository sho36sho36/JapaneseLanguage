import re
from plugin import Plugin


class WaitPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'待つ\s+(.+)',
            line
        )

        if not match:
            return None

        seconds = match.group(1)

        return f"time.sleep({seconds})"