/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

const systemChrome = ["/usr/bin/google-chrome", "/usr/bin/chromium"].find((path) => existsSync(path));
if (systemChrome) {
  Config.setBrowserExecutable(systemChrome);
}
