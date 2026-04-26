import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateContractCorpus } from "../../packages/core/src/index.js";

describe("core enforcement boundary", () => {
  it("returns a fail-closed result when the canonical contract root is missing", async () => {
    const result = await validateContractCorpus(
      path.resolve(process.cwd(), "contracts-does-not-exist")
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("failed to read contract corpus");
    }
  });

  it("exposes reusable contract validation without redefining contract truth", async () => {
    const result = await validateContractCorpus(path.resolve(process.cwd(), "contracts"));

    expect(result.ok).toBe(true);
  });
});
