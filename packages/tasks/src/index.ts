export * from "@trigger.dev/sdk"; // Export values and types from the Trigger.dev sdk

import { configure } from "@trigger.dev/sdk";

configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
  baseURL: process.env.TRIGGER_API_URL,
});