import sys
from engine import Engine


def main():
    if len(sys.argv) < 2:
        print("実行するファイルを指定してください。")
        print("例: py main.py programs/hello.jp")
        return

    filename = sys.argv[1]

    engine = Engine()
    engine.run_file(filename)


if __name__ == "__main__":
    main()