import json
import shutil
import subprocess
from pathlib import Path


class PackageError(Exception):
    """パッケージ関連のエラー"""
    pass


class PackageManager:
    def __init__(self, install_dir=None):
        if install_dir is None:
            install_dir = (
                Path.home()
                / ".japanese-language"
                / "packages"
            )

        self.install_dir = Path(install_dir)
        self.install_dir.mkdir(
            parents=True,
            exist_ok=True
        )

    def read_manifest(self, package_dir):
        package_dir = Path(package_dir)
        manifest_path = package_dir / "package.jpkg"

        if not manifest_path.exists():
            raise PackageError(
                f"package.jpkg が見つかりません: {manifest_path}"
            )

        try:
            return json.loads(
                manifest_path.read_text(
                    encoding="utf-8-sig"
                )
            )
        except json.JSONDecodeError as e:
            raise PackageError(
                f"package.jpkg のJSON形式が正しくありません: {e}"
            ) from e

    def validate_manifest(self, manifest):
        required = [
            "name",
            "version",
            "main"
        ]

        for key in required:
            if not isinstance(manifest.get(key), str):
                raise PackageError(
                    f"package.jpkg に「{key}」が必要です。"
                )

            if not manifest[key].strip():
                raise PackageError(
                    f"package.jpkg の「{key}」が空です。"
                )

        return True

    def load_package(self, package_dir):
        package_dir = Path(package_dir).resolve()

        if not package_dir.exists():
            raise PackageError(
                f"パッケージが見つかりません: {package_dir}"
            )

        manifest = self.read_manifest(package_dir)
        self.validate_manifest(manifest)

        main_path = (
            package_dir / manifest["main"]
        ).resolve()

        if not main_path.exists():
            raise PackageError(
                f"メインファイルが見つかりません: {main_path}"
            )

        return {
            "path": package_dir,
            "manifest": manifest,
            "main": main_path
        }

    def is_installed(self, name):
        return (
            self.install_dir / name
        ).is_dir()

    def get_installed_package(self, name):
        package_dir = self.install_dir / name

        if not package_dir.is_dir():
            return None

        return self.load_package(package_dir)

    def init_package(self, directory="."):
        package_dir = Path(directory).resolve()
        package_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        manifest_path = package_dir / "package.jpkg"

        if manifest_path.exists():
            raise PackageError(
                f"すでにpackage.jpkgがあります: {manifest_path}"
            )

        manifest = {
            "name": package_dir.name,
            "version": "1.0.0",
            "description": "",
            "author": "",
            "main": "src/main.jp",
            "license": "MIT"
        }

        src_dir = package_dir / "src"
        src_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        manifest_path.write_text(
            json.dumps(
                manifest,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        main_path = src_dir / "main.jp"

        if not main_path.exists():
            main_path.write_text(
                '表示する「Hello, Japanese Language!」\n',
                encoding="utf-8"
            )

        return package_dir

    def list_packages(self):
        packages = []

        if not self.install_dir.exists():
            return packages

        for directory in sorted(
            self.install_dir.iterdir()
        ):
            if not directory.is_dir():
                continue

            # 内部用の一時・バックアップフォルダは除外
            if directory.name.startswith("."):
                continue

            try:
                package = self.load_package(
                    directory
                )

                manifest = package["manifest"]

                packages.append({
                    "name": manifest["name"],
                    "version": manifest["version"],
                    "path": str(directory)
                })

            except PackageError:
                continue

        return packages

    def install_from_git(self, repository):
        repository = repository.strip()

        if repository.startswith("github:"):
            repository = repository[7:]

        if repository.startswith(
            "https://github.com/"
        ) or repository.startswith(
            "http://github.com/"
        ):
            repository = repository.rstrip("/")

            if repository.endswith(".git"):
                repository = repository[:-4]

            repository = repository.split(
                "github.com/",
                1
            )[1]

        elif (
            "/" in repository
            and "://" not in repository
        ):
            repository = repository

        else:
            raise PackageError(
                f"GitHubリポジトリを認識できません: {repository}"
            )

        parts = repository.split("/")

        if len(parts) != 2:
            raise PackageError(
                "GitHubリポジトリは owner/repository 形式で指定してください。"
            )

        owner, repo = parts

        clone_url = (
            f"https://github.com/{owner}/{repo}.git"
        )

        temp_dir = (
            self.install_dir
            / f".{repo}.tmp"
        )

        if temp_dir.exists():
            try:
                shutil.rmtree(temp_dir)
            except OSError as e:
                raise PackageError(
                    f"一時フォルダを削除できません: {e}"
                ) from e

        try:
            subprocess.run(
                [
                    "git",
                    "clone",
                    "--depth",
                    "1",
                    clone_url,
                    str(temp_dir)
                ],
                check=True
            )

            package = self.load_package(temp_dir)

            package_name = package["manifest"]["name"]

            final_dir = (
                self.install_dir / package_name
            )

            backup_dir = (
                self.install_dir
                / f".{package_name}.old"
            )

            if backup_dir.exists():
                try:
                    shutil.rmtree(backup_dir)
                except OSError as e:
                    raise PackageError(
                        f"古いバックアップを削除できません: {e}"
                    ) from e

            if final_dir.exists():
                try:
                    final_dir.rename(backup_dir)
                except OSError as e:
                    raise PackageError(
                        f"既存パッケージを退避できません: {e}"
                    ) from e

            try:
                temp_dir.rename(final_dir)

            except OSError as e:
                if backup_dir.exists() and not final_dir.exists():
                    try:
                        backup_dir.rename(final_dir)
                    except OSError:
                        pass

                raise PackageError(
                    f"新しいパッケージを配置できません: {e}"
                ) from e

            if backup_dir.exists():
                try:
                    shutil.rmtree(backup_dir)
                except OSError:
                    # Windowsで古い.gitがロックされていても
                    # 新しいパッケージのインストール自体は成功扱いにする
                    pass

            return self.load_package(final_dir)

        except subprocess.CalledProcessError as e:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                except OSError:
                    pass

            raise PackageError(
                f"GitHubからパッケージを取得できませんでした: {e}"
            ) from e

        except PackageError:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                except OSError:
                    pass

            raise

        except Exception as e:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                except OSError:
                    pass

            raise PackageError(
                f"パッケージのインストールに失敗しました: {e}"
            ) from e
    def remove_package(self, name):
        package_dir = self.install_dir / name

        if not package_dir.exists():
            raise PackageError(
                f"インストールされていません: {name}"
            )

        shutil.rmtree(package_dir)

        return True
