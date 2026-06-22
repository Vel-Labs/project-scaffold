import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateContractCorpus } from "../../packages/core/src/index.js";

const contractsDir = path.resolve(process.cwd(), "contracts");

describe("contract corpus", () => {
  it("validates canonical schemas and examples from contracts/", async () => {
    const result = await validateContractCorpus(contractsDir);

    expect(result).toEqual({
      ok: true,
      checked: {
        schemas: 15,
        validExamples: 14,
        invalidExamples: 20,
        contractArtifacts: 15
      }
    });
  });
});
