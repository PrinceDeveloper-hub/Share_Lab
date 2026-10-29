import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { wayfinder } from "@laravel/vite-plugin-wayfinder";

export default defineConfig(() => {
    // 1. Initialize with your standard frontend plugins
    const plugins = [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),
    ];

    // 2. ONLY push the wayfinder plugin if we are NOT running a Vercel build
    if (!process.env.VERCEL) {
        plugins.push(wayfinder());
    }

    return {
        plugins: plugins,
    };
});
