from plugin import Plugin, BlockCommand


class EndPlugin(Plugin):
    """
    終わり の処理。
    """

    def translate(self, line):

        if line != "終わり":
            return None

        return BlockCommand(
            code=None,
            action="end",
            block_type=None
        )