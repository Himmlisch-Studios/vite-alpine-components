import { parse } from 'node-html-parser';
import { globSync } from 'tinyglobby';
import path from 'node:path';
import fs from 'node:fs';

const tagNameExpr = "x-([$-\\w]+)";
const validNameExpr = "[$A-Z_][0-9A-Z_$]*";
const attrNameExpr = "[a-z0-9_-]+";
const attrDataExpr = '[^"]*';
const attrMatcher = new RegExp(`(${attrNameExpr}|)(?:="(${attrDataExpr})")?`, "gsi");
function alpineComponents(pluginConfig) {
    const { paths = ["components/**/*.html"], strict = true, } = { ...pluginConfig };
    let config;
    const tagMatcher = new RegExp(`<${tagNameExpr}((?:\\s{1,}(${attrNameExpr}|)(="${attrDataExpr}")?)*)\\s*(?:\\/>|>\\s*<\\/x-\\1>)`, "gsi");
    const fileList = new Set();
    function renderSnippets(code) {
        var _a;
        if (!config) {
            return code;
        }
        const matches = code.matchAll(tagMatcher);
        for (const match of matches) {
            let [tag, component, _attrs] = match;
            const passedAttributes = new Map();
            for (const [_, name, value] of _attrs.trim().matchAll(attrMatcher)) {
                if (name) {
                    passedAttributes.set(name, value !== undefined ? value : true);
                }
            }
            const root = config.root;
            const discoveryPaths = paths.map((v) => path.join(root, v));
            const filePath = globSync(discoveryPaths).find((potentialFilename) => {
                const { name } = path.parse(potentialFilename);
                return name === component;
            });
            if (!filePath) {
                throw new Error(`Couldn't find '<x-${component}>' partial file. Check your 'paths' config.`);
            }
            if (!fs.existsSync(filePath)) {
                throw new Error(`Component partial file '${filePath}' doesn't exists.`);
            }
            const isValid = component.match(validNameExpr);
            if (!isValid) {
                if (strict) {
                    throw new Error(`Strict name check failed for component '<x-${component}>'`);
                }
            }
            fileList.add(filePath);
            let out = tag;
            try {
                const html = fs.readFileSync(filePath, "utf8");
                const dom = parse(html);
                const domTag = dom.firstElementChild;
                if (domTag === undefined) {
                    throw new Error(`Empty component '<x-${component}>'.`);
                }
                const attributes = {};
                if (domTag === null || domTag === void 0 ? void 0 : domTag.attributes) {
                    for (const [key, value] of Object.entries(domTag.attributes)) {
                        attributes[key] = value;
                    }
                }
                for (const [key, value] of passedAttributes) {
                    if (attributes[key]) {
                        if (key === "style") {
                            attributes[key] = [
                                ...attributes[key].split(";"),
                                value,
                            ].map((v) => v.trim()).filter((v) => v).join("; ");
                        }
                        else if (key === "class") {
                            attributes[key] = [
                                ...attributes[key].split(" "),
                                value,
                            ].map((v) => v.trim()).filter((v) => v).join(" ");
                        }
                        else {
                            attributes[key] = value;
                        }
                    }
                    else {
                        attributes[key] = value;
                    }
                }
                if (isValid) {
                    const fakeXData = (_a = attributes["x-data"]) !== null && _a !== void 0 ? _a : "";
                    attributes["x-data"] = `${component}(${fakeXData})`;
                }
                domTag.setAttributes(attributes);
                const outHtml = domTag.toString();
                out = renderSnippets(outHtml);
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error("[Alpine Components]: " + error.message);
                }
                throw new Error(`${error}`);
            }
            code = code.replace(tag, out);
        }
        return code;
    }
    return {
        name: "vite-alpine-components-plugin",
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        handleHotUpdate({ file, server }) {
            if (fileList.has(file)) {
                server.ws.send({
                    type: "full-reload",
                    path: "*",
                });
            }
        },
        transformIndexHtml: {
            enforce: "pre",
            transform(html) {
                return renderSnippets(html);
            },
            // ^ Keeping for Vite below version 4.0.0            order: "pre",
            order: "pre",
            handler(html) {
                return renderSnippets(html);
            },
        },
    };
}

export { alpineComponents as default };
//# sourceMappingURL=index.js.map
