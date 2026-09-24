import re
from core.plugin import Plugin


class MultiplyPlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'掛ける\s+(.+?)\s+(.+)',
            line
        )

        if not match:
            return None

        target = match.group(1).strip()
        value = match.group(2).strip()

        if re.fullmatch(r'-?\d+(?:\.\d+)?', target):
            return f"print(({target}) * ({value}))"

        if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*|[^\W\d]\w*', target):
            return f"{target} *= {value}"

        return f"print(({target}) * ({value}))"