import re
from core.plugin import Plugin


class ListRemovePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'リスト「([^」]+)」から「(.*)」を削除する',
            line
        )

        if not match:
            return None

        name = match.group(1)
        value = match.group(2)

        return f"{name}.remove({value!r})"