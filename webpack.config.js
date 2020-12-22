const path = require("path");

module.exports = [
    {
        // Input
        entry: "./src/server/server.ts",
        resolve: {
            extensions: [".ts", ".js"]
        },

        // Processing
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    include: [
                        path.resolve(__dirname, "src/server")
                    ],
                    exclude: /node_modules/
                }
            ]
        },

        // Output
        mode: "development",
        devtool: "inline-source-map",
        output: {
            filename: "server.js",
            path: path.resolve(__dirname, "dist")
        },
    }
];