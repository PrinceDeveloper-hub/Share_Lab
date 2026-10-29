import { wayfinder } from "@laravel/vite-plugin-wayfinder";
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),

        // This line checks if the VERCEL environment variable exists.
        // If it does, it skips loading the wayfinder plugin entirely.
        !process.env.VERCEL ? wayfinder() : null,
    ].filter(Boolean), // Cleans up the array by removing the 'null' on Vercel
});
