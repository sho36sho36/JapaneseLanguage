export class ModuleError extends Error {
    constructor(message) {
        super(message);
        this.name = "ModuleError";
    }
}

export class ModuleLoader {
    constructor(engine) {
        this.engine = engine;
        this.loadedModules = new Set();
    }

    async loadSource(source, filename = "module.jp") {
        if (this.loadedModules.has(filename)) {
            return;
        }

        this.loadedModules.add(filename);

        await this.engine.run(source, filename);
    }

    async loadPackage(packageData) {
        const filename =
            `${packageData.owner}/${packageData.repository}/${packageData.manifest.main}`;

        await this.loadSource(
            packageData.source,
            filename
        );
    }
}
