import re
from plugin import Plugin


class ListAddPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'リスト「([^」]+)」に「(.*)」を追加する',
            line
        )

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        return f"{name}.append({value!r})"