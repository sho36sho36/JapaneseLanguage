import re
from core.plugin import Plugin


class UpperPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'大文字にする\s+(.+)',
            line
        )

        if not match:
            return None

        value = match.group(1).strip()

        # 「文字」→ '文字'
        if value.startswith("「") and value.endswith("」"):
            value = repr(value[1:-1])

        return f"print(str({value}).upper())"