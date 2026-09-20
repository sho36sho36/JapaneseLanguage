from core.plugin import Plugin, BlockCommand


class ElsePlugin(Plugin):
    """
    それ以外 の処理。
    """

    def translate(self, line):

        if line != "それ以外":
            return None

        return BlockCommand(
            code="else:",
            action="else",
            block_type="if"
        )