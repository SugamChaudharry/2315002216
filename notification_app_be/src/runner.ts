import { getTopInbox } from "./index.js";

const accessToken = process.argv[2] || process.env.EVALUATION_ACCESS_TOKEN;

if (!accessToken) {
  console.error("Usage: npm run top-inbox -- <access_token> or set EVALUATION_ACCESS_TOKEN");
  process.exit(1);
}

async function main() {
  try {
    const notifications = await getTopInbox(accessToken as string, 10);
    console.log(JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error("Failed to compute top inbox:", error);
    process.exit(1);
  }
}

main();
