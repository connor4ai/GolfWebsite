import type { SiteConfig } from "./types";
import highmarkRidge from "./highmark-ridge.config";

/**
 * ACTIVE SITE CONFIGURATION
 * -------------------------
 * This is the only line that changes when deploying for a different client.
 * Point it at any file that exports a complete `SiteConfig`.
 *
 * Example: to preview the daily-fee municipal variant, swap to
 *   import dailyFee from "./examples/daily-fee.config";
 *   const active: SiteConfig = dailyFee;
 */
const active: SiteConfig = highmarkRidge;

export default active;
