import { defineDynamicResource, defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name:
    env.mode === "staging" ? "[INTERNAL] My Binance Average Price Calculator" : "My Binance Average Price Calculator",
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  permissions: ["webNavigation", "https://www.binance.com/en/trade/*"],
  web_accessible_resources: [
    defineDynamicResource({
      matches: ["https://www.binance.com/en/trade/*"],
    }),
  ],
}));
