from plugin import Plugin, BlockCommand


class BreakPlugin(Plugin):
    """
    抜ける の処理。
    """

    def translate(self, line):

        if line != "抜ける":
            return None

        return BlockCommand(
            code="break",
            action="break",
            block_type=None
        )