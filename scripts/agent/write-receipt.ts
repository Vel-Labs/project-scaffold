import { writeAgentReceipt } from "../../packages/core/src/index.js";

const receiptInput = process.argv[2];
if (!receiptInput) {
  console.error("Usage: npm run agent:write-receipt -- path/to/receipt.json");
  process.exit(1);
}

const result = await writeAgentReceipt(process.cwd(), receiptInput);

if (!result.ok) {
  console.error("Receipt write failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Receipt written: ${result.file}`);
