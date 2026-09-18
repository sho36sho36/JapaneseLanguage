import re
from plugin import Plugin, BlockCommand


class RepeatPlugin(Plugin):
    """
    繰り返す ～回 の処理。
    """

    def translate(self, line):

        match = re.fullmatch(
            r'繰り返す\s+(.+?)(?:回)?',
            line
        )

        if not match:
            return None

        count = match.group(1)

        return BlockCommand(
            code=f"for _ in range({count}):",
            action="start",
            block_type="loop"
        )