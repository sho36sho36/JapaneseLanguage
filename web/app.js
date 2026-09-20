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
    // ========================================
    // 値を解析
    // ========================================
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
        const target = runtime.get(
          name.trim()
        );
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
    // ========================================
    // 計算式かどうか
    // ========================================
    looksLikeExpression(expression) {
      return /[+\-*/%]/.test(expression) || />=|<=|===|!==|==|!=|>|</.test(expression);
    }
    // ========================================
    // 計算・条件式
    // ========================================
    evaluate(expression, runtime) {
      let expr = String(expression).trim();
      if (expr === "") {
        return "";
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
        return fn(...values);
      } catch (error) {
        throw new Error(
          `式を計算できません: ${expression}`
        );
      }
    }
    // ========================================
    // 引数を分割
    //
    // 例:
    // 10, 50, 20
    //
    // ↓
    // ["10", "50", "20"]
    // ========================================
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
    // ========================================
    // 正規表現用エスケープ
    // ========================================
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

  // web/engine/engine.js
  var WebEngine = class {
    constructor(output2 = null) {
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
          const result = this.parser.evaluate(
            condition,
            this.runtime
          );
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
          const count = Number(
            this.parser.parseValue(
              expression,
              this.runtime
            )
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
        const handled = await this.plugins.execute(
          line,
          context
        );
        if (!handled) {
          throw new Error(
            `行 ${i + 1}: 理解できない命令です: ${line}`
          );
        }
      }
      return null;
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
      throw new Error(
        `行 ${start + 1}: 「終わり」がありません。`
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
    try {
      const engine = createEngine();
      await engine.run(
        editor.value
      );
      setStatus("実行完了");
    } catch (error) {
      output.textContent += `エラー: ${error.message}
`;
      setStatus("実行エラー");
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
    setStatus("クリアしました");
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
        `${file.name} を開きました`
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
      `${a.download} を保存しました`
    );
  }
  function saveAsFile() {
    const name = window.prompt(
      "ファイル名を入力してください",
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
    "Japanese Language Web v2.0.0"
  );
})();
