// vite.config.js
import { fileURLToPath, URL } from "url";
import react from "file:///C:/Users/OWNER/Desktop/vesored/src/frontend/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@20.19.43_/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///C:/Users/OWNER/Desktop/vesored/src/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.43/node_modules/vite/dist/node/index.js";
import environment from "file:///C:/Users/OWNER/Desktop/vesored/src/frontend/node_modules/.pnpm/vite-plugin-environment@1.1_4193cd14e692343b272ca23dc81234b2/node_modules/vite-plugin-environment/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/OWNER/Desktop/vesored/src/frontend/vite.config.js";
var ii_url = process.env.DFX_NETWORK === "local" ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/` : `https://identity.internetcomputer.org/`;
process.env.II_URL = process.env.II_URL || ii_url;
process.env.STORAGE_GATEWAY_URL = process.env.STORAGE_GATEWAY_URL || "https://blob.caffeine.ai";
var vite_config_default = defineConfig({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: false
  },
  css: {
    postcss: "./postcss.config.js"
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true
      }
    }
  },
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["II_URL"]),
    environment(["STORAGE_GATEWAY_URL"]),
    react()
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", __vite_injected_original_import_meta_url))
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    ],
    dedupe: ["@dfinity/agent"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxPV05FUlxcXFxEZXNrdG9wXFxcXHZlc29yZWRcXFxcc3JjXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxPV05FUlxcXFxEZXNrdG9wXFxcXHZlc29yZWRcXFxcc3JjXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9PV05FUi9EZXNrdG9wL3Zlc29yZWQvc3JjL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcInVybFwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCBlbnZpcm9ubWVudCBmcm9tIFwidml0ZS1wbHVnaW4tZW52aXJvbm1lbnRcIjtcclxuXHJcbmNvbnN0IGlpX3VybCA9XHJcbiAgcHJvY2Vzcy5lbnYuREZYX05FVFdPUksgPT09IFwibG9jYWxcIlxyXG4gICAgPyBgaHR0cDovL3JkbXg2LWphYWFhLWFhYWFhLWFhYWRxLWNhaS5sb2NhbGhvc3Q6ODA4MS9gXHJcbiAgICA6IGBodHRwczovL2lkZW50aXR5LmludGVybmV0Y29tcHV0ZXIub3JnL2A7XHJcblxyXG5wcm9jZXNzLmVudi5JSV9VUkwgPSBwcm9jZXNzLmVudi5JSV9VUkwgfHwgaWlfdXJsO1xyXG5wcm9jZXNzLmVudi5TVE9SQUdFX0dBVEVXQVlfVVJMID1cclxuICBwcm9jZXNzLmVudi5TVE9SQUdFX0dBVEVXQVlfVVJMIHx8IFwiaHR0cHM6Ly9ibG9iLmNhZmZlaW5lLmFpXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGxvZ0xldmVsOiBcImVycm9yXCIsXHJcbiAgYnVpbGQ6IHtcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgIG1pbmlmeTogZmFsc2UsXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6IFwiLi9wb3N0Y3NzLmNvbmZpZy5qc1wiLFxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovLzEyNy4wLjAuMTo0OTQzXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIGVudmlyb25tZW50KFwiYWxsXCIsIHsgcHJlZml4OiBcIkNBTklTVEVSX1wiIH0pLFxyXG4gICAgZW52aXJvbm1lbnQoXCJhbGxcIiwgeyBwcmVmaXg6IFwiREZYX1wiIH0pLFxyXG4gICAgZW52aXJvbm1lbnQoW1wiSUlfVVJMXCJdKSxcclxuICAgIGVudmlyb25tZW50KFtcIlNUT1JBR0VfR0FURVdBWV9VUkxcIl0pLFxyXG4gICAgcmVhY3QoKSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiBcImRlY2xhcmF0aW9uc1wiLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuLi9kZWNsYXJhdGlvbnNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiBcIkBcIixcclxuICAgICAgICByZXBsYWNlbWVudDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgZGVkdXBlOiBbXCJAZGZpbml0eS9hZ2VudFwiXSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVSxTQUFTLGVBQWUsV0FBVztBQUNwVyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxpQkFBaUI7QUFIbUwsSUFBTSwyQ0FBMkM7QUFLNVAsSUFBTSxTQUNKLFFBQVEsSUFBSSxnQkFBZ0IsVUFDeEIsdURBQ0E7QUFFTixRQUFRLElBQUksU0FBUyxRQUFRLElBQUksVUFBVTtBQUMzQyxRQUFRLElBQUksc0JBQ1YsUUFBUSxJQUFJLHVCQUF1QjtBQUVyQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixVQUFVO0FBQUEsRUFDVixPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFlBQVksT0FBTyxFQUFFLFFBQVEsWUFBWSxDQUFDO0FBQUEsSUFDMUMsWUFBWSxPQUFPLEVBQUUsUUFBUSxPQUFPLENBQUM7QUFBQSxJQUNyQyxZQUFZLENBQUMsUUFBUSxDQUFDO0FBQUEsSUFDdEIsWUFBWSxDQUFDLHFCQUFxQixDQUFDO0FBQUEsSUFDbkMsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLGNBQWMsSUFBSSxJQUFJLG1CQUFtQix3Q0FBZSxDQUFDO0FBQUEsTUFDeEU7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQzlEO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUSxDQUFDLGdCQUFnQjtBQUFBLEVBQzNCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
