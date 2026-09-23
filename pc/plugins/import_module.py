import re
from core.plugin import Plugin


class ImportModulePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'読み込む「(.+)」',
            line
        )

        if match:
            path = match.group(1)
            return f'__jp_import_module__({path!r})'

        return None
