import re
from core.plugin import Plugin


class IncreasePlugin(Plugin):
    def translate(self, line):
        match = re.fullmatch(
            r'増やす\s+(.+?)\s+(.+)',
            line
        )

        if not match:
            return None

        target = match.group(1).strip()
        value = match.group(2).strip()

        # 数値・式なら「結果を表示」
        if re.fullmatch(r'-?\d+(?:\.\d+)?', target):
            return f"print(({target}) + ({value}))"

        # 変数なら値を変更
        if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*|[^\W\d]\w*', target):
            return f"{target} += {value}"

        # その他は式として計算
        return f"print(({target}) + ({value}))"