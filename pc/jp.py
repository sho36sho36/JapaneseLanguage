import sys
from pc.engine import Engine


VERSION = "2.2.0"

def show_help():
    print("Japanese Language")
    print(f"繝舌・繧ｸ繝ｧ繝ｳ: {VERSION}")
    print()
    print("菴ｿ縺・婿:")
    print("  jp 繝輔ぃ繧､繝ｫ.jp")
    print()
    print("萓・")
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
        print("繧ｨ繝ｩ繝ｼ: .jp 繝輔ぃ繧､繝ｫ繧呈欠螳壹＠縺ｦ縺上□縺輔＞縲・)
        return 1

    try:
        engine = Engine()
        engine.run_file(filename)

    except FileNotFoundError:
        print(f"繧ｨ繝ｩ繝ｼ: 繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ: {filename}")
        return 1

    except UnicodeDecodeError:
        print("繧ｨ繝ｩ繝ｼ: 繝輔ぃ繧､繝ｫ繧旦TF-8縺ｧ隱ｭ縺ｿ霎ｼ繧√∪縺帙ｓ縲・)
        return 1

    except Exception as error:
        print("螳溯｡御ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・)
        print(f"隧ｳ邏ｰ: {error}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
