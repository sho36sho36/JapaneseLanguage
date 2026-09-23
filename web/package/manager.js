export class PackageError extends Error {
    constructor(message) {
        super(message);
        this.name = "PackageError";
    }
}

export class PackageManager {
    constructor() {
        this.cache = new Map();
    }

    normalizeRepository(repository) {
        repository = repository.trim();

        if (repository.startsWith("github:")) {
            repository = repository.slice(7);
        }

        if (
            repository.startsWith("https://github.com/") ||
            repository.startsWith("http://github.com/")
        ) {
            repository = repository
                .replace(/\.git\/?$/, "")
                .replace(/\/$/, "");

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
        const { owner, name } =
            this.normalizeRepository(repository);

        const manifestUrl =
            this.getRawUrl(owner, name, "package.jpkg");

        const manifestText =
            await this.fetchText(manifestUrl);

        let manifest;

        try {
            manifest = JSON.parse(manifestText.replace(/^\uFEFF/, ""));
        } catch (error) {
            throw new PackageError(
                `package.jpkg のJSON形式が正しくありません。`
            );
        }

        for (const key of ["name", "version", "main"]) {
            if (
                typeof manifest[key] !== "string" ||
                !manifest[key].trim()
            ) {
                throw new PackageError(
                    `package.jpkg に「${key}」がありません。`
                );
            }
        }

        const mainUrl =
            this.getRawUrl(owner, name, manifest.main);

        const source =
            await this.fetchText(mainUrl);

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
            packageData => ({
                name: packageData.manifest.name,
                version: packageData.manifest.version
            })
        );
    }
}
