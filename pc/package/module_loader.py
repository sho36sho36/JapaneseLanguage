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
            return module_path.resolve()

        # まず、現在のファイルを基準に探す
        local_path = (
            self.base_dir / module_path
        ).resolve()

        if local_path.exists():
            return local_path

        # 見つからなければプロジェクトルートを探す
        project_root = self.base_dir

        while project_root.parent != project_root:
            if (
                (project_root / "pc").is_dir()
                and (project_root / "web").is_dir()
            ):
                break

            project_root = project_root.parent

        root_path = (
            project_root / module_path
        ).resolve()

        if root_path.exists():
            return root_path

        # 見つからなかった場合は、最初に試したパスを返す
        return local_path

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
            source = path.read_text(
                encoding="utf-8-sig"
            )
        except OSError as error:
            raise ModuleError(
                f"モジュールを読み込めません: {error}"
            ) from error

        self.loaded_modules.add(path)

        return {
            "path": path,
            "source": source,
            "already_loaded": False,
        }