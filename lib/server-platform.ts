export type ServerPlatform = {
  database?: D1Database;
  adminEmails: string;
  trustsChatGPTHeaders: boolean;
};

// Next.js/Vercel has neither the Sites D1 binding nor its trusted auth proxy.
// Vite replaces this module with server-platform.sites.ts for Sites builds.
export const serverPlatform: ServerPlatform = {
  adminEmails: "",
  trustsChatGPTHeaders: false,
};
