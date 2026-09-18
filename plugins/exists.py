import re
from plugin import Plugin


class ExistsPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'存在する\s+(.+)', line)

        if not match:
            return None

        name = match.group(1)

        return f"print({name!r} in globals())"