import re
from core.plugin import Plugin


class InputPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'入力する「([^」]+)」',
            line
        )

        if not match:
            return None

        name = match.group(1)

        return f'{name} = input("入力してください: ")'