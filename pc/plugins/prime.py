import re
from core.plugin import Plugin


class PrimePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(r'素数か\s+(.+)', line)
        if not match:
            return None

        value = match.group(1)

        code = (
            f"print(({value}) >= 2 and "
            f"all(({value}) % i != 0 for i in range(2, int(({value}) ** 0.5) + 1)))"
        )

        return code