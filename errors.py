class JapaneseLanguageError(Exception):
    """自作言語の基本エラー"""

    def __init__(self, message, filename=None, line=None):
        self.message = message
        self.filename = filename
        self.line = line

        super().__init__(self.format_message())

    def format_message(self):
        location = ""

        if self.filename:
            location += self.filename

        if self.line is not None:
            location += f":{self.line}"

        if location:
            return f"{location}: {self.message}"

        return self.message


class SyntaxErrorJapanese(JapaneseLanguageError):
    """構文エラー"""
    pass


class RuntimeErrorJapanese(JapaneseLanguageError):
    """実行時エラー"""
    pass