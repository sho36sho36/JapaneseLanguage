import re
from plugin import Plugin, BlockCommand


class IfPlugin(Plugin):
    """
    もし ～ の処理。
    """

    def translate(self, line):

        match = re.fullmatch(
            r'もし\s+(.+)',
            line
        )

        if not match:
            return None

        condition = match.group(1)

        return BlockCommand(
            code=f"if {condition}:",
            action="start",
            block_type="if"
        )