from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class BlockCommand:
    """
    ブロック構文用の変換結果。
    """
    code: str | None
    action: str
    block_type: str | None = None


class Plugin(ABC):
    """
    自作言語プラグインの基本クラス。
    """

    @abstractmethod
    def translate(self, line):
        """
        1行をPythonコードへ変換する。

        変換できない場合は None。
        """
        return None


class PluginManager:
    """
    プラグインを管理するクラス。
    """

    def __init__(self):
        self.plugins = []

    def register(self, plugin):
        self.plugins.append(plugin)

    def translate(self, line):
        """
        登録されたプラグインに順番に処理させる。
        """
        for plugin in self.plugins:
            result = plugin.translate(line)

            if result is not None:
                return result

        return None