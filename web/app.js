(() => {
  // web/engine/parser.js
  var JapaneseParser = class {
    constructor() {
      this.operators = [
        "===",
        "!==",
        ">=",
        "<=",
        "==",
        "!=",
        ">",
        "<",
        "+",
        "-",
        "*",
        "/",
        "%"
      ];
    }
    // ============================================================
    // 値を解析
    // ============================================================
    parseValue(expression, runtime) {
      if (expression === void 0 || expression === null) {
        return "";
      }
      let value = String(expression).trim();
      if (value === "") {
        return "";
      }
      if (value.startsWith("「") && value.endsWith("」")) {
        return value.slice(1, -1);
      }
      if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
      }
      if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1);
      }
      if (value === "true") {
        return true;
      }
      if (value === "false") {
        return false;
      }
      if (value === "真") {
        return true;
      }
      if (value === "偽") {
        return false;
      }
      if (value === "null" || value === "なし") {
        return null;
      }
      if (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
        return Number(value);
      }
      if (runtime && runtime.exists(value)) {
        return runtime.get(value);
      }
      const indexMatch = value.match(
        /^(.+)\[(-?\d+)\]$/
      );
      if (indexMatch && runtime) {
        const [, name, indexText] = indexMatch;
        const target = runtime.get(name.trim());
        const index = Number(indexText);
        if (Array.isArray(target)) {
          return target[index];
        }
      }
      if (this.looksLikeExpression(value)) {
        try {
          return this.evaluate(
            value,
            runtime
          );
        } catch {
        }
      }
      return value;
    }
    // ============================================================
    // 数値として解析
    // ============================================================
    parseNumber(expression, runtime) {
      const value = this.parseValue(
        expression,
        runtime
      );
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(
          `「${expression}」は数値ではありません。`
        );
      }
      return value;
    }
    // ============================================================
    // 計算式かどうか
    // ============================================================
    looksLikeExpression(expression) {
      return /[+\-*/%]/.test(expression) || />=|<=|===|!==|==|!=|>|</.test(expression);
    }
    // ============================================================
    // 計算・条件式
    // ============================================================
    evaluate(expression, runtime) {
      let expr = String(expression).trim();
      if (expr === "") {
        throw new Error(
          "式が空です。"
        );
      }
      expr = expr.replace(/\b真\b/g, "true").replace(/\b偽\b/g, "false");
      expr = expr.replace(
        /「([^「」]*)」/g,
        (_, text) => JSON.stringify(text)
      );
      const variables = [];
      if (runtime) {
        for (const name of runtime.names()) {
          const safeName = `__jp_var_${variables.length}`;
          variables.push({
            name,
            safeName,
            value: runtime.get(name)
          });
          const escapedName = this.escapeRegExp(name);
          expr = expr.replace(
            new RegExp(
              `(?<![\\w])${escapedName}(?![\\w])`,
              "g"
            ),
            safeName
          );
        }
      }
      try {
        const names = variables.map(
          (item) => item.safeName
        );
        const values = variables.map(
          (item) => item.value
        );
        const fn = new Function(
          ...names,
          `"use strict"; return (${expr});`
        );
        const result = fn(...values);
        return result;
      } catch (error) {
        throw new Error(
          `式「${expression}」を計算できません。`
        );
      }
    }
    // ============================================================
    // 引数を分割
    // ============================================================
    splitArguments(expression) {
      const result = [];
      let current = "";
      let depth = 0;
      let inJapaneseQuote = false;
      let inDoubleQuote = false;
      let inSingleQuote = false;
      for (const char of String(expression)) {
        if (char === "「" && !inDoubleQuote && !inSingleQuote) {
          inJapaneseQuote = true;
          current += char;
          continue;
        }
        if (char === "」" && inJapaneseQuote) {
          inJapaneseQuote = false;
          current += char;
          continue;
        }
        if (char === '"' && !inJapaneseQuote && !inSingleQuote) {
          inDoubleQuote = !inDoubleQuote;
          current += char;
          continue;
        }
        if (char === "'" && !inJapaneseQuote && !inDoubleQuote) {
          inSingleQuote = !inSingleQuote;
          current += char;
          continue;
        }
        if (char === "(" && !inJapaneseQuote && !inDoubleQuote && !inSingleQuote) {
          depth++;
          current += char;
          continue;
        }
        if (char === ")" && !inJapaneseQuote && !inDoubleQuote && !inSingleQuote) {
          depth = Math.max(
            0,
            depth - 1
          );
          current += char;
          continue;
        }
        if (char === "," && !inJapaneseQuote && !inDoubleQuote && !inSingleQuote && depth === 0) {
          if (current.trim() !== "") {
            result.push(
              current.trim()
            );
          }
          current = "";
          continue;
        }
        current += char;
      }
      if (current.trim() !== "") {
        result.push(
          current.trim()
        );
      }
      return result;
    }
    // ============================================================
    // 正規表現用エスケープ
    // ============================================================
    escapeRegExp(text) {
      return String(text).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
    }
  };

  // web/engine/runtime.js
  var Runtime = class {
    constructor(outputElement = null) {
      this.variables = {};
      this.outputElement = outputElement;
      this.output = [];
    }
    // ========================================
    // 変数
    // ========================================
    set(name, value) {
      this.variables[name] = value;
    }
    get(name) {
      if (!this.exists(name)) {
        throw new Error(
          `変数「${name}」が存在しません。`
        );
      }
      return this.variables[name];
    }
    exists(name) {
      return Object.prototype.hasOwnProperty.call(
        this.variables,
        name
      );
    }
    names() {
      return Object.keys(this.variables);
    }
    clearVariables() {
      this.variables = {};
    }
    // ========================================
    // 出力
    // ========================================
    write(value) {
      const text = String(value);
      this.output.push(text);
      if (this.outputElement) {
        this.outputElement.textContent += text + "\n";
      }
    }
    clearOutput() {
      this.output = [];
      if (this.outputElement) {
        this.outputElement.textContent = "";
      }
    }
    // ========================================
    // Runtime全体をリセット
    // ========================================
    clear() {
      this.clearVariables();
      this.clearOutput();
    }
  };

  // web/engine/plugin.js
  var WebPlugin = class {
    constructor(name) {
      this.name = name;
    }
    matches(line) {
      if (line === this.name) {
        return true;
      }
      if (line.startsWith(this.name + " ")) {
        return true;
      }
      if (line.startsWith(this.name + "「")) {
        return true;
      }
      return false;
    }
    async execute(line, context) {
      throw new Error(
        `${this.name} プラグインに execute() が実装されていません。`
      );
    }
  };
  var PluginManager = class {
    constructor() {
      this.plugins = [];
    }
    register(plugin) {
      this.plugins.push(plugin);
    }
    find(line) {
      return this.plugins.find(
        (plugin) => plugin.matches(line)
      );
    }
    async execute(line, context) {
      const plugin = this.find(line);
      if (!plugin) {
        return false;
      }
      await plugin.execute(line, context);
      return true;
    }
  };

  // web/package/manager.js
  var PackageError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "PackageError";
    }
  };
  var PackageManager = class {
    constructor() {
      this.cache = /* @__PURE__ */ new Map();
    }
    normalizeRepository(repository) {
      repository = repository.trim();
      if (repository.startsWith("github:")) {
        repository = repository.slice(7);
      }
      if (repository.startsWith("https://github.com/") || repository.startsWith("http://github.com/")) {
        repository = repository.replace(/\.git\/?$/, "").replace(/\/$/, "");
        const parts = repository.split("/");
        return {
          owner: parts[parts.length - 2],
          name: parts[parts.length - 1]
        };
      }
      if (repository.includes("/") && !repository.includes("://")) {
        const parts = repository.split("/");
        return {
          owner: parts[0],
          name: parts[1].replace(/\.git$/, "")
        };
      }
      throw new PackageError(
        `GitHubリポジトリを認識できません: ${repository}`
      );
    }
    getRawUrl(owner, repository, path) {
      return `https://raw.githubusercontent.com/${owner}/${repository}/main/${path}`;
    }
    async fetchText(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new PackageError(
          `ファイルを取得できませんでした: ${response.status} ${response.statusText}`
        );
      }
      return await response.text();
    }
    async install(repository) {
      const { owner, name } = this.normalizeRepository(repository);
      const manifestUrl = this.getRawUrl(owner, name, "package.jpkg");
      const manifestText = await this.fetchText(manifestUrl);
      let manifest;
      try {
        manifest = JSON.parse(manifestText.replace(/^\uFEFF/, ""));
      } catch (error) {
        throw new PackageError(
          `package.jpkg のJSON形式が正しくありません。`
        );
      }
      for (const key of ["name", "version", "main"]) {
        if (typeof manifest[key] !== "string" || !manifest[key].trim()) {
          throw new PackageError(
            `package.jpkg に「${key}」がありません。`
          );
        }
      }
      const mainUrl = this.getRawUrl(owner, name, manifest.main);
      const source = await this.fetchText(mainUrl);
      const packageData = {
        owner,
        repository: name,
        manifest,
        source,
        mainUrl
      };
      this.cache.set(manifest.name, packageData);
      return packageData;
    }
    get(name) {
      return this.cache.get(name) || null;
    }
    has(name) {
      return this.cache.has(name);
    }
    list() {
      return [...this.cache.values()].map(
        (packageData) => ({
          name: packageData.manifest.name,
          version: packageData.manifest.version
        })
      );
    }
  };

  // web/plugins/display.js
  var DisplayPlugin = class extends WebPlugin {
    constructor() {
      super("表示する");
    }
    async execute(line, context) {
      const expression = line.replace(/^表示する\s*/, "");
      const value = context.parser.parseValue(
        expression,
        context.runtime
      );
      context.runtime.write(value);
    }
  };

  // web/plugins/variable.js
  var VariablePlugin = class extends WebPlugin {
    constructor() {
      super("変数");
    }
    async execute(line, context) {
      const match = line.match(
        /^変数「([^「」]+)」に入れる(?:\s*)(.+)$/
      );
      if (!match) {
        throw new Error(
          `変数の書式が正しくありません: ${line}`
        );
      }
      const [, name, expression] = match;
      const value = context.parser.parseValue(
        expression.trim(),
        context.runtime
      );
      context.runtime.set(name, value);
    }
  };

  // web/plugins/input.js
  var InputPlugin = class extends WebPlugin {
    constructor() {
      super("入力する");
    }
    async execute(line, context) {
      const match = line.match(
        /^入力する\s+「([^「」]+)」(?:\s+(.+))?$/
      );
      if (!match) {
        throw new Error(
          `入力するの書式が正しくありません: ${line}`
        );
      }
      const [, variableName, message] = match;
      const promptMessage = message ? context.parser.parseValue(
        message,
        context.runtime
      ) : variableName;
      const value = window.prompt(
        String(promptMessage)
      );
      context.runtime.set(
        variableName,
        value ?? ""
      );
    }
  };

  // web/plugins/calculate.js
  var CalculatePlugin = class extends WebPlugin {
    constructor() {
      super("計算する");
    }
    async execute(line, context) {
      const expression = line.replace(/^計算する\s*/, "");
      const value = context.parser.evaluate(
        expression,
        context.runtime
      );
      context.runtime.write(value);
    }
  };

  // web/plugins/wait.js
  var WaitPlugin = class extends WebPlugin {
    constructor() {
      super("待つ");
    }
    async execute(line, context) {
      const expression = line.replace(/^待つ\s*/, "");
      const seconds = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      if (!Number.isFinite(seconds)) {
        throw new Error(
          `待つには数字を指定してください: ${line}`
        );
      }
      await new Promise((resolve) => {
        setTimeout(resolve, Math.max(0, seconds * 1e3));
      });
    }
  };

  // web/plugins/increase.js
  var IncreasePlugin = class extends WebPlugin {
    constructor() {
      super("増やす");
    }
    async execute(line, context) {
      const match = line.match(
        /^増やす\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `増やすの書式が正しくありません: ${line}`
        );
      }
      const [, name, amountExpression] = match;
      const current = Number(
        context.runtime.get(name)
      );
      const amount = Number(
        context.parser.parseValue(
          amountExpression,
          context.runtime
        )
      );
      context.runtime.set(
        name,
        current + amount
      );
    }
  };

  // web/plugins/decrease.js
  var DecreasePlugin = class extends WebPlugin {
    constructor() {
      super("減らす");
    }
    async execute(line, context) {
      const match = line.match(
        /^減らす\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `減らすの書式が正しくありません: ${line}`
        );
      }
      const [, name, amountExpression] = match;
      const current = Number(
        context.runtime.get(name)
      );
      const amount = Number(
        context.parser.parseValue(
          amountExpression,
          context.runtime
        )
      );
      context.runtime.set(
        name,
        current - amount
      );
    }
  };

  // web/plugins/multiply.js
  var MultiplyPlugin = class extends WebPlugin {
    constructor() {
      super("掛ける");
    }
    async execute(line, context) {
      const match = line.match(
        /^掛ける\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `掛けるの書式が正しくありません: ${line}`
        );
      }
      const [, name, expression] = match;
      const current = Number(
        context.runtime.get(name)
      );
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      context.runtime.set(
        name,
        current * value
      );
    }
  };

  // web/plugins/divide.js
  var DividePlugin = class extends WebPlugin {
    constructor() {
      super("割る");
    }
    async execute(line, context) {
      const match = line.match(
        /^割る\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `割るの書式が正しくありません: ${line}`
        );
      }
      const [, name, expression] = match;
      const current = Number(
        context.runtime.get(name)
      );
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      if (value === 0) {
        throw new Error(
          "0で割ることはできません。"
        );
      }
      context.runtime.set(
        name,
        current / value
      );
    }
  };

  // web/plugins/remainder.js
  var RemainderPlugin = class extends WebPlugin {
    constructor() {
      super("余り");
    }
    async execute(line, context) {
      const match = line.match(
        /^余り\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `余りの書式が正しくありません: ${line}`
        );
      }
      const [, name, expression] = match;
      const current = Number(
        context.runtime.get(name)
      );
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      if (value === 0) {
        throw new Error(
          "0で割ることはできません。"
        );
      }
      context.runtime.set(
        name,
        current % value
      );
    }
  };

  // web/plugins/to_number.js
  var ToNumberPlugin = class extends WebPlugin {
    constructor() {
      super("数字にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^数字にする\s*/, "");
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      context.runtime.write(value);
    }
  };

  // web/plugins/to_string.js
  var ToStringPlugin = class extends WebPlugin {
    constructor() {
      super("文字にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^文字にする\s*/, "");
      const value = context.parser.parseValue(
        expression,
        context.runtime
      );
      context.runtime.write(
        String(value)
      );
    }
  };

  // web/plugins/concat.js
  var ConcatPlugin = class extends WebPlugin {
    constructor() {
      super("文字をつなぐ");
    }
    async execute(line, context) {
      const expression = line.replace(/^文字をつなぐ\s*/, "");
      const values = context.parser.splitArguments(expression).map(
        (value) => context.parser.parseValue(
          value,
          context.runtime
        )
      );
      context.runtime.write(
        values.map(String).join("")
      );
    }
  };

  // web/plugins/upper.js
  var UpperPlugin = class extends WebPlugin {
    constructor() {
      super("大文字にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^大文字にする\s*/, "");
      const value = context.parser.parseValue(
        expression,
        context.runtime
      );
      context.runtime.write(
        String(value).toUpperCase()
      );
    }
  };

  // web/plugins/lower.js
  var LowerPlugin = class extends WebPlugin {
    constructor() {
      super("小文字にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^小文字にする\s*/, "");
      const value = context.parser.parseValue(
        expression,
        context.runtime
      );
      context.runtime.write(
        String(value).toLowerCase()
      );
    }
  };

  // web/plugins/maximum.js
  var MaximumPlugin = class extends WebPlugin {
    constructor() {
      super("最大");
    }
    async execute(line, context) {
      const expression = line.replace(/^最大\s*/, "");
      const values = context.parser.splitArguments(expression).map(
        (value) => Number(
          context.parser.parseValue(
            value,
            context.runtime
          )
        )
      );
      context.runtime.write(
        Math.max(...values)
      );
    }
  };

  // web/plugins/minimum.js
  var MinimumPlugin = class extends WebPlugin {
    constructor() {
      super("最小");
    }
    async execute(line, context) {
      const expression = line.replace(/^最小\s*/, "");
      const values = context.parser.splitArguments(expression).map(
        (value) => Number(
          context.parser.parseValue(
            value,
            context.runtime
          )
        )
      );
      context.runtime.write(
        Math.min(...values)
      );
    }
  };

  // web/plugins/absolute.js
  var AbsolutePlugin = class extends WebPlugin {
    constructor() {
      super("絶対値");
    }
    async execute(line, context) {
      const expression = line.replace(/^絶対値\s*/, "");
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      context.runtime.write(
        Math.abs(value)
      );
    }
  };

  // web/plugins/round_number.js
  var RoundNumberPlugin = class extends WebPlugin {
    constructor() {
      super("四捨五入");
    }
    async execute(line, context) {
      const expression = line.replace(/^四捨五入\s*/, "");
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      context.runtime.write(
        Math.round(value)
      );
    }
  };

  // web/plugins/exists.js
  var ExistsPlugin = class extends WebPlugin {
    constructor() {
      super("存在する");
    }
    async execute(line, context) {
      const expression = line.replace(/^存在する\s*/, "");
      const name = expression.replace(/^「|」$/g, "").trim();
      context.runtime.write(
        context.runtime.exists(name)
      );
    }
  };

  // web/plugins/average.js
  var AveragePlugin = class extends WebPlugin {
    constructor() {
      super("平均");
    }
    async execute(line, context) {
      const expression = line.replace(/^平均\s*/, "");
      const values = expression.split(",").map(
        (v) => Number(context.parser.parseValue(v.trim(), context.runtime))
      );
      context.runtime.write(
        values.reduce((a, b) => a + b, 0) / values.length
      );
    }
  };

  // web/plugins/sum.js
  var SumPlugin = class extends WebPlugin {
    constructor() {
      super("合計");
    }
    async execute(line, context) {
      const expression = line.replace(/^合計\s*/, "");
      const values = expression.split(",").map(
        (v) => Number(context.parser.parseValue(v.trim(), context.runtime))
      );
      context.runtime.write(
        values.reduce((a, b) => a + b, 0)
      );
    }
  };

  // web/plugins/range.js
  var RangePlugin = class extends WebPlugin {
    constructor() {
      super("範囲");
    }
    async execute(line, context) {
      const expression = line.replace(/^範囲\s*/, "");
      const values = expression.split(",").map(
        (v) => Number(context.parser.parseValue(v.trim(), context.runtime))
      );
      context.runtime.write(
        Math.max(...values) - Math.min(...values)
      );
    }
  };

  // web/plugins/even.js
  var EvenPlugin = class extends WebPlugin {
    constructor() {
      super("偶数か");
    }
    async execute(line, context) {
      const expression = line.replace(/^偶数か\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(value % 2 === 0);
    }
  };

  // web/plugins/odd.js
  var OddPlugin = class extends WebPlugin {
    constructor() {
      super("奇数か");
    }
    async execute(line, context) {
      const expression = line.replace(/^奇数か\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(value % 2 !== 0);
    }
  };

  // web/plugins/positive.js
  var PositivePlugin = class extends WebPlugin {
    constructor() {
      super("正数か");
    }
    async execute(line, context) {
      const expression = line.replace(/^正数か\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(value > 0);
    }
  };

  // web/plugins/negative.js
  var NegativePlugin = class extends WebPlugin {
    constructor() {
      super("負数か");
    }
    async execute(line, context) {
      const expression = line.replace(/^負数か\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(value < 0);
    }
  };

  // web/plugins/zero.js
  var ZeroPlugin = class extends WebPlugin {
    constructor() {
      super("0か");
    }
    async execute(line, context) {
      const expression = line.replace(/^0か\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(value === 0);
    }
  };

  // web/plugins/string_length.js
  var StringLengthPlugin = class extends WebPlugin {
    constructor() {
      super("文字の長さ");
    }
    async execute(line, context) {
      const match = line.match(/^文字の長さ\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(match[1].length);
    }
  };

  // web/plugins/string_find.js
  var StringFindPlugin = class extends WebPlugin {
    constructor() {
      super("文字を探す");
    }
    async execute(line, context) {
      const match = line.match(/^文字を探す\s+「(.+)」\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        match[1].indexOf(match[2])
      );
    }
  };

  // web/plugins/string_replace.js
  var StringReplacePlugin = class extends WebPlugin {
    constructor() {
      super("文字を置き換える");
    }
    async execute(line, context) {
      const match = line.match(/^文字を置き換える\s+「(.+)」\s+「(.+)」\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        match[1].split(match[2]).join(match[3])
      );
    }
  };

  // web/plugins/string_slice.js
  var StringSlicePlugin = class extends WebPlugin {
    constructor() {
      super("文字を切り出す");
    }
    async execute(line, context) {
      const match = line.match(/^文字を切り出す\s+「(.+)」\s+(.+)\s+(.+)$/);
      if (!match) return;
      const start = Number(
        context.parser.parseValue(match[2], context.runtime)
      );
      const end = Number(
        context.parser.parseValue(match[3], context.runtime)
      );
      context.runtime.write(
        match[1].slice(start, end)
      );
    }
  };

  // web/plugins/strip.js
  var StripPlugin = class extends WebPlugin {
    constructor() {
      super("空白を消す");
    }
    async execute(line, context) {
      const match = line.match(/^空白を消す\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        match[1].trim()
      );
    }
  };

  // web/plugins/contains.js
  var ContainsPlugin = class extends WebPlugin {
    constructor() {
      super("文字が含まれる");
    }
    async execute(line, context) {
      const match = line.match(/^文字が含まれる\s+「(.+)」\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        match[1].includes(match[2])
      );
    }
  };

  // web/plugins/sqrt.js
  var SqrtPlugin = class extends WebPlugin {
    constructor() {
      super("平方根");
    }
    async execute(line, context) {
      const expression = line.replace(/^平方根\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(Math.sqrt(value));
    }
  };

  // web/plugins/power.js
  var PowerPlugin = class extends WebPlugin {
    constructor() {
      super("べき乗");
    }
    async execute(line, context) {
      const match = line.match(/^べき乗\s+(.+)\s+(.+)$/);
      if (!match) return;
      const a = Number(
        context.parser.parseValue(match[1], context.runtime)
      );
      const b = Number(
        context.parser.parseValue(match[2], context.runtime)
      );
      context.runtime.write(Math.pow(a, b));
    }
  };

  // web/plugins/floor.js
  var FloorPlugin = class extends WebPlugin {
    constructor() {
      super("切り捨て");
    }
    async execute(line, context) {
      const expression = line.replace(/^切り捨て\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(Math.floor(value));
    }
  };

  // web/plugins/ceil.js
  var CeilPlugin = class extends WebPlugin {
    constructor() {
      super("切り上げ");
    }
    async execute(line, context) {
      const expression = line.replace(/^切り上げ\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(Math.ceil(value));
    }
  };

  // web/plugins/random.js
  var RandomPlugin = class extends WebPlugin {
    constructor() {
      super("乱数");
    }
    async execute(line, context) {
      const match = line.match(/^乱数\s+(.+)\s+(.+)$/);
      if (!match) return;
      const min = Number(
        context.parser.parseValue(match[1], context.runtime)
      );
      const max = Number(
        context.parser.parseValue(match[2], context.runtime)
      );
      context.runtime.write(
        Math.floor(Math.random() * (max - min + 1)) + min
      );
    }
  };

  // web/plugins/gcd.js
  var GcdPlugin = class extends WebPlugin {
    constructor() {
      super("最大公約数");
    }
    async execute(line, context) {
      const match = line.match(/^最大公約数\s+(.+)\s+(.+)$/);
      if (!match) return;
      let a = Math.abs(Number(
        context.parser.parseValue(match[1], context.runtime)
      ));
      let b = Math.abs(Number(
        context.parser.parseValue(match[2], context.runtime)
      ));
      while (b !== 0) {
        [a, b] = [b, a % b];
      }
      context.runtime.write(a);
    }
  };

  // web/plugins/lcm.js
  var LcmPlugin = class extends WebPlugin {
    constructor() {
      super("最小公倍数");
    }
    async execute(line, context) {
      const match = line.match(/^最小公倍数\s+(.+)\s+(.+)$/);
      if (!match) return;
      let a = Math.abs(Number(
        context.parser.parseValue(match[1], context.runtime)
      ));
      let b = Math.abs(Number(
        context.parser.parseValue(match[2], context.runtime)
      ));
      const originalA = a;
      const originalB = b;
      while (b !== 0) {
        [a, b] = [b, a % b];
      }
      context.runtime.write(
        originalA === 0 || originalB === 0 ? 0 : Math.abs(originalA * originalB) / a
      );
    }
  };

  // web/plugins/prime.js
  var PrimePlugin = class extends WebPlugin {
    constructor() {
      super("素数か");
    }
    async execute(line, context) {
      const expression = line.replace(/^素数か\s*/, "");
      const n = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      if (n < 2 || !Number.isInteger(n)) {
        context.runtime.write(false);
        return;
      }
      for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
          context.runtime.write(false);
          return;
        }
      }
      context.runtime.write(true);
    }
  };

  // web/plugins/factorial.js
  var FactorialPlugin = class extends WebPlugin {
    constructor() {
      super("階乗");
    }
    async execute(line, context) {
      const expression = line.replace(/^階乗\s*/, "");
      const n = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      context.runtime.write(result);
    }
  };

  // web/plugins/sign.js
  var SignPlugin = class extends WebPlugin {
    constructor() {
      super("符号");
    }
    async execute(line, context) {
      const expression = line.replace(/^符号\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(Math.sign(value));
    }
  };

  // web/plugins/negate.js
  var NegatePlugin = class extends WebPlugin {
    constructor() {
      super("数値を反転");
    }
    async execute(line, context) {
      const expression = line.replace(/^数値を反転\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(-value);
    }
  };

  // web/plugins/binary.js
  var BinaryPlugin = class extends WebPlugin {
    constructor() {
      super("数値を2進数にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^数値を2進数にする\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(
        Math.trunc(value).toString(2)
      );
    }
  };

  // web/plugins/hex.js
  var HexPlugin = class extends WebPlugin {
    constructor() {
      super("数値を16進数にする");
    }
    async execute(line, context) {
      const expression = line.replace(/^数値を16進数にする\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(
        Math.trunc(value).toString(16)
      );
    }
  };

  // web/plugins/binary_to_number.js
  var BinaryToNumberPlugin = class extends WebPlugin {
    constructor() {
      super("2進数を数字にする");
    }
    async execute(line, context) {
      const match = line.match(/^2進数を数字にする\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        parseInt(match[1], 2)
      );
    }
  };

  // web/plugins/hex_to_number.js
  var HexToNumberPlugin = class extends WebPlugin {
    constructor() {
      super("16進数を数字にする");
    }
    async execute(line, context) {
      const match = line.match(/^16進数を数字にする\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        parseInt(match[1], 16)
      );
    }
  };

  // web/plugins/in_range.js
  var InRangePlugin = class extends WebPlugin {
    constructor() {
      super("数値の範囲内か");
    }
    async execute(line, context) {
      const match = line.match(/^数値の範囲内か\s+(.+)\s+(.+)\s+(.+)$/);
      if (!match) return;
      const value = Number(
        context.parser.parseValue(match[1], context.runtime)
      );
      const min = Number(
        context.parser.parseValue(match[2], context.runtime)
      );
      const max = Number(
        context.parser.parseValue(match[3], context.runtime)
      );
      context.runtime.write(
        value >= min && value <= max
      );
    }
  };

  // web/plugins/reverse_number.js
  var ReverseNumberPlugin = class extends WebPlugin {
    constructor() {
      super("正負を反転");
    }
    async execute(line, context) {
      const expression = line.replace(/^正負を反転\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(-value);
    }
  };

  // web/plugins/decimal_part.js
  var DecimalPartPlugin = class extends WebPlugin {
    constructor() {
      super("小数部分");
    }
    async execute(line, context) {
      const expression = line.replace(/^小数部分\s*/, "");
      const value = Number(
        context.parser.parseValue(
          expression,
          context.runtime
        )
      );
      const integerPart = Math.trunc(value);
      const decimalPart = value - integerPart;
      const roundedDecimalPart = Math.round(
        (decimalPart + Number.EPSILON) * 1e12
      ) / 1e12;
      context.runtime.write(
        roundedDecimalPart
      );
    }
  };

  // web/plugins/integer_part.js
  var IntegerPartPlugin = class extends WebPlugin {
    constructor() {
      super("整数部分");
    }
    async execute(line, context) {
      const expression = line.replace(/^整数部分\s*/, "");
      const value = Number(
        context.parser.parseValue(expression, context.runtime)
      );
      context.runtime.write(Math.trunc(value));
    }
  };

  // web/plugins/reverse_string.js
  var ReverseStringPlugin = class extends WebPlugin {
    constructor() {
      super("文字を反転");
    }
    async execute(line, context) {
      const match = line.match(/^文字を反転\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        [...match[1]].reverse().join("")
      );
    }
  };

  // web/plugins/first_char.js
  var FirstCharPlugin = class extends WebPlugin {
    constructor() {
      super("文字の先頭");
    }
    async execute(line, context) {
      const match = line.match(/^文字の先頭\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        [...match[1]][0] ?? ""
      );
    }
  };

  // web/plugins/last_char.js
  var LastCharPlugin = class extends WebPlugin {
    constructor() {
      super("文字の末尾");
    }
    async execute(line, context) {
      const match = line.match(/^文字の末尾\s+「(.+)」$/);
      if (!match) return;
      const chars = [...match[1]];
      context.runtime.write(
        chars.length > 0 ? chars[chars.length - 1] : ""
      );
    }
  };

  // web/plugins/is_number.js
  var IsNumberPlugin = class extends WebPlugin {
    constructor() {
      super("文字が数字か");
    }
    async execute(line, context) {
      const match = line.match(/^文字が数字か\s+「(.+)」$/);
      if (!match) return;
      context.runtime.write(
        /^[0-9]+(?:\.[0-9]+)?$/.test(match[1])
      );
    }
  };

  // web/plugins/is_empty.js
  var IsEmptyPlugin = class extends WebPlugin {
    constructor() {
      super("文字が空か");
    }
    async execute(line, context) {
      const match = line.match(/^文字が空か\s+「(.*)」$/);
      if (!match) return;
      context.runtime.write(
        match[1].length === 0
      );
    }
  };

  // web/plugins/list.js
  var ListPlugin = class extends WebPlugin {
    constructor() {
      super("リスト");
    }
    async execute(line, context) {
      let match;
      match = line.match(
        /^リスト「([^「」]+)」を作る$/
      );
      if (match) {
        const [, name] = match;
        context.runtime.set(name, []);
        return;
      }
      match = line.match(
        /^リスト「([^「」]+)」に(.+)を追加する$/
      );
      if (match) {
        const [, name, expression] = match;
        const list = context.runtime.get(name);
        if (!Array.isArray(list)) {
          throw new Error(
            `「${name}」はリストではありません。`
          );
        }
        const value = context.parser.parseValue(
          expression.trim(),
          context.runtime
        );
        list.push(value);
        return;
      }
      match = line.match(
        /^リスト「([^「」]+)」から(.+)を削除する$/
      );
      if (match) {
        const [, name, expression] = match;
        const list = context.runtime.get(name);
        if (!Array.isArray(list)) {
          throw new Error(
            `「${name}」はリストではありません。`
          );
        }
        const value = context.parser.parseValue(
          expression.trim(),
          context.runtime
        );
        const index = list.indexOf(value);
        if (index !== -1) {
          list.splice(index, 1);
        }
        return;
      }
      match = line.match(
        /^リスト「([^「」]+)」から取り出す\s+(.+)$/
      );
      if (match) {
        const [, name, expression] = match;
        const list = context.runtime.get(name);
        if (!Array.isArray(list)) {
          throw new Error(
            `「${name}」はリストではありません。`
          );
        }
        const index = Number(
          context.parser.parseValue(
            expression,
            context.runtime
          )
        );
        context.runtime.write(
          list[index]
        );
        return;
      }
      match = line.match(
        /^リスト「([^「」]+)」の長さ$/
      );
      if (match) {
        const [, name] = match;
        const list = context.runtime.get(name);
        if (!Array.isArray(list)) {
          throw new Error(
            `「${name}」はリストではありません。`
          );
        }
        context.runtime.write(
          list.length
        );
        return;
      }
      throw new Error(
        `リストの書式が正しくありません: ${line}`
      );
    }
  };

  // web/plugins/import_package.js
  var ImportPackagePlugin = class extends WebPlugin {
    constructor() {
      super("読み込む");
    }
    matches(line) {
      return /^読み込む「.+」$/.test(line);
    }
    async execute(line, context) {
      const match = line.match(/^読み込む「(.+)」$/);
      if (!match) {
        throw new Error(
          "読み込むの形式が正しくありません。"
        );
      }
      await context.engine.importPackage(
        match[1]
      );
    }
  };

  // web/engine/engine.js
  var WebLanguageError = class extends Error {
    constructor(message, lineNumber = null, cause = null) {
      let text = "";
      if (lineNumber !== null) {
        text += `行番号: ${lineNumber}
`;
      }
      text += `エラー: ${message}`;
      if (cause) {
        text += `
原因: ${cause}`;
      }
      super(text);
      this.name = "JapaneseLanguageError";
      this.lineNumber = lineNumber;
      this.cause = cause;
    }
  };
  var WebEngine = class {
    constructor(output2 = null) {
      this.version = "2.2.0";
      this.runtime = new Runtime(output2);
      this.parser = new JapaneseParser();
      this.plugins = new PluginManager();
      this.packageManager = new PackageManager();
      this.registerPlugins();
    }
    registerPlugins() {
      this.plugins.register(new DisplayPlugin());
      this.plugins.register(new VariablePlugin());
      this.plugins.register(new InputPlugin());
      this.plugins.register(new CalculatePlugin());
      this.plugins.register(new WaitPlugin());
      this.plugins.register(new IncreasePlugin());
      this.plugins.register(new DecreasePlugin());
      this.plugins.register(new MultiplyPlugin());
      this.plugins.register(new DividePlugin());
      this.plugins.register(new RemainderPlugin());
      this.plugins.register(new ToNumberPlugin());
      this.plugins.register(new ToStringPlugin());
      this.plugins.register(new ConcatPlugin());
      this.plugins.register(new UpperPlugin());
      this.plugins.register(new LowerPlugin());
      this.plugins.register(new MaximumPlugin());
      this.plugins.register(new MinimumPlugin());
      this.plugins.register(new AbsolutePlugin());
      this.plugins.register(new RoundNumberPlugin());
      this.plugins.register(new ExistsPlugin());
      this.plugins.register(new AveragePlugin());
      this.plugins.register(new SumPlugin());
      this.plugins.register(new RangePlugin());
      this.plugins.register(new EvenPlugin());
      this.plugins.register(new OddPlugin());
      this.plugins.register(new PositivePlugin());
      this.plugins.register(new NegativePlugin());
      this.plugins.register(new ZeroPlugin());
      this.plugins.register(new StringLengthPlugin());
      this.plugins.register(new StringFindPlugin());
      this.plugins.register(new StringReplacePlugin());
      this.plugins.register(new StringSlicePlugin());
      this.plugins.register(new StripPlugin());
      this.plugins.register(new ContainsPlugin());
      this.plugins.register(new SqrtPlugin());
      this.plugins.register(new PowerPlugin());
      this.plugins.register(new FloorPlugin());
      this.plugins.register(new CeilPlugin());
      this.plugins.register(new RandomPlugin());
      this.plugins.register(new GcdPlugin());
      this.plugins.register(new LcmPlugin());
      this.plugins.register(new PrimePlugin());
      this.plugins.register(new FactorialPlugin());
      this.plugins.register(new SignPlugin());
      this.plugins.register(new NegatePlugin());
      this.plugins.register(new BinaryPlugin());
      this.plugins.register(new HexPlugin());
      this.plugins.register(new BinaryToNumberPlugin());
      this.plugins.register(new HexToNumberPlugin());
      this.plugins.register(new InRangePlugin());
      this.plugins.register(new ReverseNumberPlugin());
      this.plugins.register(new DecimalPartPlugin());
      this.plugins.register(new IntegerPartPlugin());
      this.plugins.register(new ReverseStringPlugin());
      this.plugins.register(new FirstCharPlugin());
      this.plugins.register(new LastCharPlugin());
      this.plugins.register(new IsNumberPlugin());
      this.plugins.register(new IsEmptyPlugin());
      this.plugins.register(new ListPlugin());
      this.plugins.register(new ImportPackagePlugin());
    }
    async importPackage(repository) {
      const packageData = await this.packageManager.install(repository);
      const lines = packageData.source.split(/\r?\n/);
      this.validateBlocks(lines);
      await this.executeLines(
        lines,
        0,
        lines.length
      );
      return packageData;
    }
    getContext() {
      return {
        engine: this,
        runtime: this.runtime,
        parser: this.parser
      };
    }
    async run(code) {
      this.runtime.clear();
      const lines = code.split(/\r?\n/);
      this.validateBlocks(lines);
      await this.executeLines(
        lines,
        0,
        lines.length
      );
      return this.runtime.output;
    }
    async executeLines(lines, start, end) {
      const context = this.getContext();
      for (let i = start; i < end; i++) {
        const raw = lines[i];
        if (raw === void 0) {
          continue;
        }
        const line = raw.trim();
        if (!line) {
          continue;
        }
        if (line.startsWith("//")) {
          continue;
        }
        if (line === "終わり") {
          return {
            index: i,
            type: "end"
          };
        }
        if (line === "それ以外") {
          return {
            index: i,
            type: "else"
          };
        }
        if (line === "抜ける") {
          return {
            index: i,
            type: "break"
          };
        }
        if (line.startsWith("もし ")) {
          const condition = line.replace(/^もし\s*/, "");
          const block = this.findBlock(
            lines,
            i,
            end
          );
          let result;
          try {
            result = this.parser.evaluate(
              condition,
              this.runtime
            );
          } catch (error) {
            throw this.createLineError(
              i + 1,
              "条件式を評価できません。",
              error.message
            );
          }
          if (result) {
            const innerResult = await this.executeLines(
              lines,
              i + 1,
              block.elseIndex >= 0 ? block.elseIndex : block.endIndex
            );
            if (innerResult && innerResult.type === "break") {
              return innerResult;
            }
          } else if (block.elseIndex >= 0) {
            const innerResult = await this.executeLines(
              lines,
              block.elseIndex + 1,
              block.endIndex
            );
            if (innerResult && innerResult.type === "break") {
              return innerResult;
            }
          }
          i = block.endIndex;
          continue;
        }
        if (line.startsWith("繰り返す ")) {
          const expression = line.replace(/^繰り返す\s*/, "").replace(/回$/, "").trim();
          let count;
          try {
            count = this.parser.parseNumber(
              expression,
              this.runtime
            );
          } catch (error) {
            throw this.createLineError(
              i + 1,
              "繰り返し回数を数値として扱えません。",
              error.message
            );
          }
          if (!Number.isFinite(count)) {
            throw this.createLineError(
              i + 1,
              "繰り返し回数を数値として扱えません。",
              "「繰り返す」に指定する値は数値にしてください。"
            );
          }
          count = Math.max(
            0,
            Math.floor(count)
          );
          const block = this.findBlock(
            lines,
            i,
            end
          );
          for (let n = 0; n < count; n++) {
            const result = await this.executeLines(
              lines,
              i + 1,
              block.endIndex
            );
            if (result && result.type === "break") {
              break;
            }
          }
          i = block.endIndex;
          continue;
        }
        try {
          const handled = await this.plugins.execute(
            line,
            context
          );
          if (!handled) {
            throw this.createLineError(
              i + 1,
              "理解できない命令です。",
              `「${line}」という命令は登録されていません。`
            );
          }
        } catch (error) {
          if (error instanceof WebLanguageError) {
            throw error;
          }
          throw this.createLineError(
            i + 1,
            "命令を実行できませんでした。",
            error.message
          );
        }
      }
      return null;
    }
    validateBlocks(lines) {
      const stack = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("//")) {
          continue;
        }
        if (line.startsWith("もし ")) {
          stack.push({
            type: "if",
            line: i + 1,
            hasElse: false
          });
          continue;
        }
        if (line.startsWith("繰り返す ")) {
          stack.push({
            type: "loop",
            line: i + 1,
            hasElse: false
          });
          continue;
        }
        if (line === "それ以外") {
          if (stack.length === 0) {
            throw this.createLineError(
              i + 1,
              "「それ以外」の対応する「もし」がありません。",
              "「それ以外」は「もし」の中で使用してください。"
            );
          }
          const current = stack[stack.length - 1];
          if (current.type !== "if") {
            throw this.createLineError(
              i + 1,
              "「それ以外」をここでは使用できません。",
              "「それ以外」は「もし」の中で使用してください。"
            );
          }
          if (current.hasElse) {
            throw this.createLineError(
              i + 1,
              "「それ以外」を複数回使用しています。",
              "1つの「もし」に対して「それ以外」は1回だけ使用できます。"
            );
          }
          current.hasElse = true;
          continue;
        }
        if (line === "終わり") {
          if (stack.length === 0) {
            throw this.createLineError(
              i + 1,
              "対応するブロックがありません。",
              "この「終わり」に対応する「もし」または「繰り返す」がありません。"
            );
          }
          stack.pop();
          continue;
        }
      }
      if (stack.length > 0) {
        const block = stack[stack.length - 1];
        const blockName = block.type === "if" ? "もし" : "繰り返す";
        throw this.createLineError(
          block.line,
          `「${blockName}」のブロックが閉じられていません。`,
          `この「${blockName}」に対応する「終わり」を追加してください。`
        );
      }
    }
    findBlock(lines, start, end) {
      let depth = 0;
      let elseIndex = -1;
      for (let i = start; i < end; i++) {
        const line = lines[i].trim();
        if (line.startsWith("もし ") || line.startsWith("繰り返す ")) {
          depth++;
          continue;
        }
        if (line === "終わり") {
          depth--;
          if (depth === 0) {
            return {
              elseIndex,
              endIndex: i
            };
          }
          continue;
        }
        if (line === "それ以外" && depth === 1) {
          elseIndex = i;
        }
      }
      throw this.createLineError(
        start + 1,
        "ブロックを閉じられません。",
        "対応する「終わり」がありません。"
      );
    }
    createLineError(lineNumber, message, cause = null) {
      return new WebLanguageError(
        message,
        lineNumber,
        cause
      );
    }
  };

  // web/main.js
  var editor = document.getElementById("editor");
  var output = document.getElementById("output");
  var status = document.getElementById("status");
  var currentFileName = "program.jp";
  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }
  function createEngine() {
    return new WebEngine(output);
  }
  async function runProgram() {
    output.textContent = "";
    setStatus("実行中...");
    try {
      const engine = createEngine();
      await engine.run(
        editor.value
      );
      setStatus("実行完了");
    } catch (error) {
      output.textContent = error?.message || String(error);
      setStatus("実行エラー");
    }
  }
  function saveLocal() {
    localStorage.setItem(
      "japanese-language-code",
      editor.value
    );
    localStorage.setItem(
      "japanese-language-file-name",
      currentFileName
    );
    setStatus("ローカル保存しました");
  }
  function loadLocal() {
    const savedCode = localStorage.getItem(
      "japanese-language-code"
    );
    const savedFileName = localStorage.getItem(
      "japanese-language-file-name"
    );
    if (savedCode !== null) {
      editor.value = savedCode;
    }
    if (savedFileName !== null) {
      currentFileName = savedFileName;
    }
  }
  function clearEditor() {
    editor.value = "";
    output.textContent = "";
    currentFileName = "program.jp";
    setStatus("クリアしました");
  }
  function openFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jp,text/plain";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        editor.value = String(
          reader.result ?? ""
        );
        currentFileName = file.name;
        saveLocal();
        setStatus(
          `${file.name} を開きました`
        );
      };
      reader.onerror = () => {
        setStatus("ファイルを読み込めませんでした");
      };
      reader.readAsText(
        file,
        "UTF-8"
      );
    });
    input.click();
  }
  function saveFile() {
    const blob = new Blob(
      [editor.value],
      {
        type: "text/plain;charset=utf-8"
      }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    saveLocal();
    setStatus(
      `${currentFileName} を保存しました`
    );
  }
  function saveAsFile() {
    const name = window.prompt(
      "ファイル名を入力してください",
      currentFileName
    );
    if (name === null) {
      return;
    }
    let fileName = name.trim();
    if (!fileName) {
      fileName = "program";
    }
    if (!fileName.toLowerCase().endsWith(".jp")) {
      fileName += ".jp";
    }
    currentFileName = fileName;
    saveFile();
  }
  function setupButtons() {
    const openButton = document.getElementById("openButton");
    const saveButton = document.getElementById("saveButton");
    const saveAsButton = document.getElementById("saveAsButton");
    const runButton = document.getElementById("runButton");
    const clearButton = document.getElementById("clearButton");
    if (openButton) {
      openButton.addEventListener(
        "click",
        openFile
      );
    }
    if (saveButton) {
      saveButton.addEventListener(
        "click",
        saveFile
      );
    }
    if (saveAsButton) {
      saveAsButton.addEventListener(
        "click",
        saveAsFile
      );
    }
    if (runButton) {
      runButton.addEventListener(
        "click",
        runProgram
      );
    }
    if (clearButton) {
      clearButton.addEventListener(
        "click",
        clearEditor
      );
    }
  }
  function setupEditor() {
    if (!editor) {
      return;
    }
    editor.addEventListener(
      "keydown",
      (event) => {
        if (event.ctrlKey && event.key === "Enter") {
          event.preventDefault();
          runProgram();
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          const value = editor.value;
          editor.value = value.substring(
            0,
            start
          ) + "    " + value.substring(
            end
          );
          editor.selectionStart = start + 4;
          editor.selectionEnd = start + 4;
        }
      }
    );
  }
  loadLocal();
  setupButtons();
  setupEditor();
  setStatus(
    "Japanese Language Web v2.2.0"
  );
})();
