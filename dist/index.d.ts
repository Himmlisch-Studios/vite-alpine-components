import type { Plugin } from "vite";
type ViteAlpineComponentsOpts = {
    /**
     * Paths to search for Alpine components
     * @default ['components/**\/*.html']
     */
    paths: string[];
    /**
     * Checks all components have a JS compliant name.
     *
     * Set to `false`, to allow invalid names such as `<x-partial-something />`.
     *
     * Invalid-named components aren't treated as Alpine components
     *
     * @default true
     */
    strict: boolean;
};
declare function alpineComponents(pluginConfig?: Partial<ViteAlpineComponentsOpts>): Plugin;
export default alpineComponents;
