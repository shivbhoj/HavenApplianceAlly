import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Disable incremental static regeneration cache to avoid
  // requiring a WORKER_SELF_REFERENCE service binding on first deploy
  incrementalCache: "dummy",
});
