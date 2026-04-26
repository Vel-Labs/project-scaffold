import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateContractCorpus } from "../packages/core/src/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractsDir = path.join(repoRoot, "contracts");
const result = await validateContractCorpus(contractsDir);

if (!result.ok) {
  console.error("Contract validation failed:");
  for (const error of result.errors) {
    console.error(`- ${path.relative(repoRoot, error)}`);
  }
  process.exit(1);
}

console.log(
  `Contract validation passed: ${result.checked.schemas} schema(s), ` +
    `${result.checked.validExamples} valid example(s), ` +
    `${result.checked.invalidExamples} invalid example(s).`
);
