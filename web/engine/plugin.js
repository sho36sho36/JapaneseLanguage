export class WebPlugin {
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
}


export class PluginManager {
    constructor() {
        this.plugins = [];
    }

    register(plugin) {
        this.plugins.push(plugin);
    }

    find(line) {
        return this.plugins.find(
            plugin => plugin.matches(line)
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
}
