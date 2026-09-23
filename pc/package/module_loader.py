from pathlib import Path


class ModuleError(Exception):
    """モジュール関連のエラー"""
    pass


class ModuleLoader:
    def __init__(self, base_dir=None):
        if base_dir is None:
            base_dir = Path.cwd()

        self.base_dir = Path(base_dir).resolve()
        self.loaded_modules = set()

    def resolve(self, module_path):
        module_path = Path(module_path)

        if not module_path.suffix:
            module_path = module_path.with_suffix(".jp")

        if module_path.is_absolute():
            path = module_path.resolve()
        else:
            path = (self.base_dir / module_path).resolve()

        return path

    def load(self, module_path):
        path = self.resolve(module_path)

        if not path.exists():
            raise ModuleError(
                f"モジュールが見つかりません: {path}"
            )

        if not path.is_file():
            raise ModuleError(
                f"モジュールがファイルではありません: {path}"
            )

        if path.suffix.lower() != ".jp":
            raise ModuleError(
                f"モジュールは .jp ファイルである必要があります: {path}"
            )

        if path in self.loaded_modules:
            return {
                "path": path,
                "source": "",
                "already_loaded": True,
            }

        try:
            source = path.read_text(encoding="utf-8-sig")
        except OSError as e:
            raise ModuleError(
                f"モジュールを読み込めません: {e}"
            ) from e

        self.loaded_modules.add(path)

        return {
            "path": path,
            "source": source,
            "already_loaded": False,
        }
