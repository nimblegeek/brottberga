import { env } from "cloudflare:workers";
import type { ServerPlatform } from "./server-platform";

export const serverPlatform: ServerPlatform = {
  get database() {
    return env.DB;
  },
  get adminEmails() {
    return (env as unknown as Record<string, string>).ADMIN_EMAILS ?? "";
  },
  trustsChatGPTHeaders: true,
};
