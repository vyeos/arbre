import { Template, defaultBuildLogger } from "e2b";
import { config } from "dotenv";
import { template } from "./template";

config({ path: "../.env" });

async function main() {
  await Template.build(template, "code-sandbox-dev", {
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);
