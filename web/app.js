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
      if (value.startsWith("\u300C") && value.endsWith("\u300D")) {
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
      if (value === "\u771F") {
        return true;
      }
      if (value === "\u507D") {
        return false;
      }
      if (value === "null" || value === "\u306A\u3057") {
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
          `\u300C${expression}\u300D\u306F\u6570\u5024\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`
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
          "\u5F0F\u304C\u7A7A\u3067\u3059\u3002"
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
          `\u5F0F\u300C${expression}\u300D\u3092\u8A08\u7B97\u3067\u304D\u307E\u305B\u3093\u3002`
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
        if (char === "\u300C" && !inDoubleQuote && !inSingleQuote) {
          inJapaneseQuote = true;
          current += char;
          continue;
        }
        if (char === "\u300D" && inJapaneseQuote) {
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
          `\u5909\u6570\u300C${name}\u300D\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002`
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
      if (line.startsWith(this.name + "\u300C")) {
        return true;
      }
      return false;
    }
    async execute(line, context) {
      throw new Error(
        `${this.name} \u30D7\u30E9\u30B0\u30A4\u30F3\u306B execute() \u304C\u5B9F\u88C5\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002`
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

  // web/plugins/display.js
  var DisplayPlugin = class extends WebPlugin {
    constructor() {
      super("\u8868\u793A\u3059\u308B");
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
      super("\u5909\u6570");
    }
    async execute(line, context) {
      const match = line.match(
        /^変数「([^「」]+)」に入れる(?:\s*)(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u5909\u6570\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
      super("\u5165\u529B\u3059\u308B");
    }
    async execute(line, context) {
      const match = line.match(
        /^入力する\s+「([^「」]+)」(?:\s+(.+))?$/
      );
      if (!match) {
        throw new Error(
          `\u5165\u529B\u3059\u308B\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
      super("\u8A08\u7B97\u3059\u308B");
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
      super("\u5F85\u3064");
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
          `\u5F85\u3064\u306B\u306F\u6570\u5B57\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${line}`
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
      super("\u5897\u3084\u3059");
    }
    async execute(line, context) {
      const match = line.match(
        /^増やす\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u5897\u3084\u3059\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
      super("\u6E1B\u3089\u3059");
    }
    async execute(line, context) {
      const match = line.match(
        /^減らす\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u6E1B\u3089\u3059\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
      super("\u639B\u3051\u308B");
    }
    async execute(line, context) {
      const match = line.match(
        /^掛ける\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u639B\u3051\u308B\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
      super("\u5272\u308B");
    }
    async execute(line, context) {
      const match = line.match(
        /^割る\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u5272\u308B\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
          "0\u3067\u5272\u308B\u3053\u3068\u306F\u3067\u304D\u307E\u305B\u3093\u3002"
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
      super("\u4F59\u308A");
    }
    async execute(line, context) {
      const match = line.match(
        /^余り\s+(.+?)\s+(.+)$/
      );
      if (!match) {
        throw new Error(
          `\u4F59\u308A\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
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
          "0\u3067\u5272\u308B\u3053\u3068\u306F\u3067\u304D\u307E\u305B\u3093\u3002"
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
      super("\u6570\u5B57\u306B\u3059\u308B");
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
      super("\u6587\u5B57\u306B\u3059\u308B");
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
      super("\u6587\u5B57\u3092\u3064\u306A\u3050");
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
      super("\u5927\u6587\u5B57\u306B\u3059\u308B");
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
      super("\u5C0F\u6587\u5B57\u306B\u3059\u308B");
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
      super("\u6700\u5927");
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
      super("\u6700\u5C0F");
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
      super("\u7D76\u5BFE\u5024");
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
      super("\u56DB\u6368\u4E94\u5165");
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
      super("\u5B58\u5728\u3059\u308B");
    }
    async execute(line, context) {
      const expression = line.replace(/^存在する\s*/, "");
      const name = expression.replace(/^「|」$/g, "").trim();
      context.runtime.write(
        context.runtime.exists(name)
      );
    }
  };

  // web/plugins/list.js
  var ListPlugin = class extends WebPlugin {
    constructor() {
      super("\u30EA\u30B9\u30C8");
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
            `\u300C${name}\u300D\u306F\u30EA\u30B9\u30C8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`
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
            `\u300C${name}\u300D\u306F\u30EA\u30B9\u30C8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`
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
            `\u300C${name}\u300D\u306F\u30EA\u30B9\u30C8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`
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
            `\u300C${name}\u300D\u306F\u30EA\u30B9\u30C8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`
          );
        }
        context.runtime.write(
          list.length
        );
        return;
      }
      throw new Error(
        `\u30EA\u30B9\u30C8\u306E\u66F8\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093: ${line}`
      );
    }
  };

  // web/engine/engine.js
  var WebLanguageError = class extends Error {
    constructor(message, lineNumber = null, cause = null) {
      let text = "";
      if (lineNumber !== null) {
        text += `\u884C\u756A\u53F7: ${lineNumber}
`;
      }
      text += `\u30A8\u30E9\u30FC: ${message}`;
      if (cause) {
        text += `
\u539F\u56E0: ${cause}`;
      }
      super(text);
      this.name = "JapaneseLanguageError";
      this.lineNumber = lineNumber;
      this.cause = cause;
    }
  };
  var WebEngine = class {
    constructor(output2 = null) {
      this.version = "2.1.0";
      this.runtime = new Runtime(output2);
      this.parser = new JapaneseParser();
      this.plugins = new PluginManager();
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
      this.plugins.register(new ListPlugin());
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
        if (line === "\u7D42\u308F\u308A") {
          return {
            index: i,
            type: "end"
          };
        }
        if (line === "\u305D\u308C\u4EE5\u5916") {
          return {
            index: i,
            type: "else"
          };
        }
        if (line === "\u629C\u3051\u308B") {
          return {
            index: i,
            type: "break"
          };
        }
        if (line.startsWith("\u3082\u3057 ")) {
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
              "\u6761\u4EF6\u5F0F\u3092\u8A55\u4FA1\u3067\u304D\u307E\u305B\u3093\u3002",
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
        if (line.startsWith("\u7E70\u308A\u8FD4\u3059 ")) {
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
              "\u7E70\u308A\u8FD4\u3057\u56DE\u6570\u3092\u6570\u5024\u3068\u3057\u3066\u6271\u3048\u307E\u305B\u3093\u3002",
              error.message
            );
          }
          if (!Number.isFinite(count)) {
            throw this.createLineError(
              i + 1,
              "\u7E70\u308A\u8FD4\u3057\u56DE\u6570\u3092\u6570\u5024\u3068\u3057\u3066\u6271\u3048\u307E\u305B\u3093\u3002",
              "\u300C\u7E70\u308A\u8FD4\u3059\u300D\u306B\u6307\u5B9A\u3059\u308B\u5024\u306F\u6570\u5024\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
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
              "\u7406\u89E3\u3067\u304D\u306A\u3044\u547D\u4EE4\u3067\u3059\u3002",
              `\u300C${line}\u300D\u3068\u3044\u3046\u547D\u4EE4\u306F\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002`
            );
          }
        } catch (error) {
          if (error instanceof WebLanguageError) {
            throw error;
          }
          throw this.createLineError(
            i + 1,
            "\u547D\u4EE4\u3092\u5B9F\u884C\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
            error.message
          );
        }
      }
      return null;
    }
    // ============================================================
    // ブロック構造チェック
    // ============================================================
    validateBlocks(lines) {
      const stack = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("//")) {
          continue;
        }
        if (line.startsWith("\u3082\u3057 ")) {
          stack.push({
            type: "if",
            line: i + 1,
            hasElse: false
          });
          continue;
        }
        if (line.startsWith("\u7E70\u308A\u8FD4\u3059 ")) {
          stack.push({
            type: "loop",
            line: i + 1,
            hasElse: false
          });
          continue;
        }
        if (line === "\u305D\u308C\u4EE5\u5916") {
          if (stack.length === 0) {
            throw this.createLineError(
              i + 1,
              "\u300C\u305D\u308C\u4EE5\u5916\u300D\u306E\u5BFE\u5FDC\u3059\u308B\u300C\u3082\u3057\u300D\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
              "\u300C\u305D\u308C\u4EE5\u5916\u300D\u306F\u300C\u3082\u3057\u300D\u306E\u4E2D\u3067\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
            );
          }
          const current = stack[stack.length - 1];
          if (current.type !== "if") {
            throw this.createLineError(
              i + 1,
              "\u300C\u305D\u308C\u4EE5\u5916\u300D\u3092\u3053\u3053\u3067\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093\u3002",
              "\u300C\u305D\u308C\u4EE5\u5916\u300D\u306F\u300C\u3082\u3057\u300D\u306E\u4E2D\u3067\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
            );
          }
          if (current.hasElse) {
            throw this.createLineError(
              i + 1,
              "\u300C\u305D\u308C\u4EE5\u5916\u300D\u3092\u8907\u6570\u56DE\u4F7F\u7528\u3057\u3066\u3044\u307E\u3059\u3002",
              "1\u3064\u306E\u300C\u3082\u3057\u300D\u306B\u5BFE\u3057\u3066\u300C\u305D\u308C\u4EE5\u5916\u300D\u306F1\u56DE\u3060\u3051\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002"
            );
          }
          current.hasElse = true;
          continue;
        }
        if (line === "\u7D42\u308F\u308A") {
          if (stack.length === 0) {
            throw this.createLineError(
              i + 1,
              "\u5BFE\u5FDC\u3059\u308B\u30D6\u30ED\u30C3\u30AF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
              "\u3053\u306E\u300C\u7D42\u308F\u308A\u300D\u306B\u5BFE\u5FDC\u3059\u308B\u300C\u3082\u3057\u300D\u307E\u305F\u306F\u300C\u7E70\u308A\u8FD4\u3059\u300D\u304C\u3042\u308A\u307E\u305B\u3093\u3002"
            );
          }
          stack.pop();
          continue;
        }
      }
      if (stack.length > 0) {
        const block = stack[stack.length - 1];
        const blockName = block.type === "if" ? "\u3082\u3057" : "\u7E70\u308A\u8FD4\u3059";
        throw this.createLineError(
          block.line,
          `\u300C${blockName}\u300D\u306E\u30D6\u30ED\u30C3\u30AF\u304C\u9589\u3058\u3089\u308C\u3066\u3044\u307E\u305B\u3093\u3002`,
          `\u3053\u306E\u300C${blockName}\u300D\u306B\u5BFE\u5FDC\u3059\u308B\u300C\u7D42\u308F\u308A\u300D\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
        );
      }
    }
    // ============================================================
    // ブロック検索
    // ============================================================
    findBlock(lines, start, end) {
      let depth = 0;
      let elseIndex = -1;
      for (let i = start; i < end; i++) {
        const line = lines[i].trim();
        if (line.startsWith("\u3082\u3057 ") || line.startsWith("\u7E70\u308A\u8FD4\u3059 ")) {
          depth++;
          continue;
        }
        if (line === "\u7D42\u308F\u308A") {
          depth--;
          if (depth === 0) {
            return {
              elseIndex,
              endIndex: i
            };
          }
          continue;
        }
        if (line === "\u305D\u308C\u4EE5\u5916" && depth === 1) {
          elseIndex = i;
        }
      }
      throw this.createLineError(
        start + 1,
        "\u30D6\u30ED\u30C3\u30AF\u3092\u9589\u3058\u3089\u308C\u307E\u305B\u3093\u3002",
        "\u5BFE\u5FDC\u3059\u308B\u300C\u7D42\u308F\u308A\u300D\u304C\u3042\u308A\u307E\u305B\u3093\u3002"
      );
    }
    // ============================================================
    // エラー生成
    // ============================================================
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
    setStatus("\u5B9F\u884C\u4E2D...");
    try {
      const engine = createEngine();
      await engine.run(
        editor.value
      );
      setStatus("\u5B9F\u884C\u5B8C\u4E86");
    } catch (error) {
      const lines = [];
      lines.push("\u5B9F\u884C\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002");
      if (error?.lineNumber !== void 0) {
        lines.push(
          `\u884C\u756A\u53F7: ${error.lineNumber}`
        );
      }
      if (error?.message) {
        lines.push(
          `\u30A8\u30E9\u30FC: ${error.message}`
        );
      }
      if (error?.cause) {
        lines.push(
          `\u539F\u56E0: ${error.cause}`
        );
      }
      if (error?.line) {
        lines.push(
          `\u30B3\u30FC\u30C9: ${error.line}`
        );
      }
      if (lines.length === 1) {
        lines.push(
          `\u30A8\u30E9\u30FC: ${String(error)}`
        );
      }
      output.textContent = lines.join("\n");
      setStatus("\u5B9F\u884C\u30A8\u30E9\u30FC");
    }
  }
  function saveLocal() {
    localStorage.setItem(
      "japanese-language-code",
      editor.value
    );
    localStorage.setItem(
      "japanese-language-file",
      currentFileName
    );
  }
  function loadLocal() {
    const code = localStorage.getItem(
      "japanese-language-code"
    );
    const fileName = localStorage.getItem(
      "japanese-language-file"
    );
    if (code !== null) {
      editor.value = code;
    }
    if (fileName) {
      currentFileName = fileName;
    }
  }
  function clearEditor() {
    editor.value = "";
    output.textContent = "";
    setStatus("\u30AF\u30EA\u30A2\u3057\u307E\u3057\u305F");
    saveLocal();
  }
  function openFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jp,text/plain";
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) {
        return;
      }
      editor.value = await file.text();
      currentFileName = file.name;
      saveLocal();
      setStatus(
        `${file.name} \u3092\u958B\u304D\u307E\u3057\u305F`
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
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName.endsWith(".jp") ? currentFileName : `${currentFileName}.jp`;
    a.click();
    URL.revokeObjectURL(url);
    saveLocal();
    setStatus(
      `${a.download} \u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F`
    );
  }
  function saveAsFile() {
    const name = window.prompt(
      "\u30D5\u30A1\u30A4\u30EB\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
      currentFileName
    );
    if (!name) {
      return;
    }
    currentFileName = name.endsWith(".jp") ? name : `${name}.jp`;
    saveFile();
  }
  document.getElementById("runButton")?.addEventListener(
    "click",
    runProgram
  );
  document.getElementById("clearButton")?.addEventListener(
    "click",
    clearEditor
  );
  document.getElementById("openButton")?.addEventListener(
    "click",
    openFile
  );
  document.getElementById("saveButton")?.addEventListener(
    "click",
    saveFile
  );
  document.getElementById("saveAsButton")?.addEventListener(
    "click",
    saveAsFile
  );
  editor?.addEventListener(
    "input",
    saveLocal
  );
  editor?.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        runProgram();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.setRangeText(
          "    ",
          start,
          end,
          "end"
        );
        saveLocal();
      }
    }
  );
  loadLocal();
  setStatus(
    "Japanese Language Web v2.1.0"
  );
})();
