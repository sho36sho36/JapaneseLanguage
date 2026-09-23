import sys
from pathlib import Path

from pc.package.manager import PackageManager, PackageError


def main(args=None):
    args = list(args or sys.argv[1:])

    if not args:
        print("使用方法: jp package <init|install|list|remove>")
        return 1

    command = args[0]
    manager = PackageManager()

    try:
        if command == "init":
            directory = Path(args[1]) if len(args) > 1 else Path.cwd()
            manifest = manager.init_package(directory)

            print("パッケージを作成しました。")
            print(f"場所: {manifest.parent}")
            print(f"設定: {manifest}")

            return 0

        if command == "list":
            packages = manager.list_packages()

            if not packages:
                print("インストール済みパッケージはありません。")
                return 0

            for package in packages:
                print(f'{package["name"]} {package["version"]}')

            return 0

        if command == "install":
            if len(args) < 2:
                print("使用方法: jp package install <GitHub URL>")
                return 1

            destination = manager.install_from_git(args[1])
            print(f"インストールしました: {destination}")

            return 0

        if command == "remove":
            if len(args) < 2:
                print("使用方法: jp package remove <パッケージ名>")
                return 1

            manager.remove_package(args[1])
            print(f'削除しました: {args[1]}')

            return 0

        print(f"不明なpackageコマンドです: {command}")
        return 1

    except PackageError as e:
        print(f"パッケージエラー: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
