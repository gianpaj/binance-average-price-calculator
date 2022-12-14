// vite.config.ts
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
var manifest = defineManifest({
  manifest_version: 3,
  name: "CRX React Devtools",
  version: pkg.version,
  content_scripts: [
    {
      js: ["src/content-script.ts"],
      matches: ["<all_urls>"],
      run_at: "document_start"
    }
  ],
  devtools_page: "src/devtools.html"
});
var vite_config_default = defineConfig({
  build: {
    rollupOptions: {
      input: {
        panel: resolve("/Users/gianpaj/tmp/crxjs/my-binance-average-price", "src/panel.html")
      }
    }
  },
  plugins: [react(), crx({ manifest })],
  optimizeDeps: {
    entries: ["src/*.html"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY3J4LCBkZWZpbmVNYW5pZmVzdCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5cbi8qKlxuICogVGhyZWUgd2F5cyB0byBkZWNsYXJlIHRoZSBtYW5pZmVzdDpcbiAqIDEuIENyZWF0ZSBhIEpTT04gYW5kIGltcG9ydCB0byB2aXRlLmNvbmZpZy50c1xuICogMi4gRGVjbGFyZSB0aGUgbWFuaWZlc3QgaW5saW5lIGluIHRoZSB2aXRlLmNvbmZpZy50c1xuICogMy4gVXNlIGBkZWZpbmVNYW5pZmVzdGAgZnVuY3Rpb24gaGVyZSBvciBpbiBvd24gZmlsZVxuICovXG5jb25zdCBtYW5pZmVzdCA9IGRlZmluZU1hbmlmZXN0KHtcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgbmFtZTogXCJDUlggUmVhY3QgRGV2dG9vbHNcIixcbiAgdmVyc2lvbjogcGtnLnZlcnNpb24sXG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIGpzOiBbXCJzcmMvY29udGVudC1zY3JpcHQudHNcIl0sXG4gICAgICBtYXRjaGVzOiBbXCI8YWxsX3VybHM+XCJdLFxuICAgICAgcnVuX2F0OiBcImRvY3VtZW50X3N0YXJ0XCIsXG4gICAgfSxcbiAgXSxcbiAgZGV2dG9vbHNfcGFnZTogXCJzcmMvZGV2dG9vbHMuaHRtbFwiLFxufSk7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIHBhbmVsOiByZXNvbHZlKFwiL1VzZXJzL2dpYW5wYWovdG1wL2NyeGpzL215LWJpbmFuY2UtYXZlcmFnZS1wcmljZVwiLCBcInNyYy9wYW5lbC5odG1sXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgY3J4KHsgbWFuaWZlc3QgfSldLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBlbnRyaWVzOiBbXCJzcmMvKi5odG1sXCJdLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLEtBQUssc0JBQXNCO0FBQ3BDLFNBQVMsb0JBQW9CO0FBUTdCLElBQU0sV0FBVyxlQUFlO0FBQUEsRUFDOUIsa0JBQWtCO0FBQUEsRUFDbEIsTUFBTTtBQUFBLEVBQ04sU0FBUyxJQUFJO0FBQUEsRUFDYixpQkFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxJQUFJLENBQUMsdUJBQXVCO0FBQUEsTUFDNUIsU0FBUyxDQUFDLFlBQVk7QUFBQSxNQUN0QixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGVBQWU7QUFDakIsQ0FBQztBQUdELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLE9BQU8sUUFBUSxxREFBcUQsZ0JBQWdCO0FBQUEsTUFDdEY7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFBQSxFQUNwQyxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsWUFBWTtBQUFBLEVBQ3hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
