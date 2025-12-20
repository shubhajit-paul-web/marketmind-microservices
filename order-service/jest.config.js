export default {
    testEnvironment: "node",
    transform: {},
    testTimeout: 30000,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules/", "/logs/", "/coverage/"],
    coverageProvider: "v8",
    setupFilesAfterEnv: ["./jest.setup.js"],
    testPathIgnorePatterns: ["/node_modules/", "/__tests__/test-utils/"],
};
