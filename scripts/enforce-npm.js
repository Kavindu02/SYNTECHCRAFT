const userAgent = process.env.npm_config_user_agent || "";

if (!userAgent.startsWith("npm/")) {
  console.error("❌ This project is configured to run with npm.");
  console.error("Use: npm run dev");
  process.exit(1);
}
