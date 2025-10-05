export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "header-max-length": [2, "always", 150],
        "type-enum": [
            2,
            "always",
            [
                "feat",
                "fix",
                "docs",
                "style",
                "refactor",
                "perf",
                "test",
                "build",
                "ci",
                "chore",
                "revert",
            ],
        ],
    },
};
