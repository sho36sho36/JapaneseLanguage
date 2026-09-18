import re
from plugin import Plugin


class ListCreatePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'リスト「([^」]+)」を作る',
            line
        )

        if not match:
            return None

        name = match.group(1)

        return f"{name} = []"