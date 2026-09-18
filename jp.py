import sys
from engine import Engine


VERSION = "1.0.0"


def show_help():
    print("Japanese Language")
    print(f"バージョン: {VERSION}")
    print()
    print("使い方:")
    print("  jp ファイル.jp")
    print()
    print("例:")
    print("  jp hello.jp")


def main():
    args = sys.argv[1:]

    if not args:
        show_help()
        return 1

    if args[0] in ("-h", "--help", "help"):
        show_help()
        return 0

    if args[0] in ("-v", "--version", "version"):
        print(VERSION)
        return 0

    filename = args[0]

    if not filename.lower().endswith(".jp"):
        print("エラー: .jp ファイルを指定してください。")
        return 1

    try:
        engine = Engine()
        engine.run_file(filename)

    except FileNotFoundError:
        print(f"エラー: ファイルが見つかりません: {filename}")
        return 1

    except UnicodeDecodeError:
        print("エラー: ファイルをUTF-8で読み込めません。")
        return 1

    except Exception as error:
        print("実行中にエラーが発生しました。")
        print(f"詳細: {error}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())