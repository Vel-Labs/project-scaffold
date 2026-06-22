import { buildContextPack } from "../../packages/core/src/index.js";

const profilePath = process.argv[2] ?? "contracts/agent-governance/context-profiles/scoped-change.json";
const result = await buildContextPack(process.cwd(), profilePath);

if (!result.ok) {
  console.error("Context pack generation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Context pack written: ${result.file}`);
