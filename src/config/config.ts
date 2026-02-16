/**
 * Application Configuration
 *
 * This file centralizes configuration loaded from environment variables or hardcoded defaults.
 * Typically in Cloudflare Workers, environment variables are accessed via the `Env` interface
 * passed to the `fetch` handler or Durable Objects.
 *
 * This file can be used for non-secret configuration constants or helper functions
 * to parse env vars if they were global (which they generally aren't in Workers without AsyncLocalStorage).
 */

export const config = {
    app: {
        name: "laburen-asistente-ventas",
        version: "0.1.0",
    },
    defaults: {
        currency: "ARS",
        locale: "es-AR",
    },
};
