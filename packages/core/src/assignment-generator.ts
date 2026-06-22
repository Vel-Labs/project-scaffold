import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateAgentAssignmentFile } from "./validate-governance.js";

type AgentAssignment = {
  schema: "agent-assignment";
  id: string;
  lifecycle: string;
  ownedBy: string;
  summary: string;
  risk: "low" | "medium" | "high" | "critical";
  routeId: string;
  workflowId: string;
  makerPersonaId: string;
  verifierPersonaId: string;
  autonomyLevel: "A0" | "A1" | "A2" | "A3" | "A4";
  allowedPaths: string[];
  forbiddenPaths: string[];
  requestedActions: string[];
  expectedChecks: string[];
  humanApprovals: Array<{
    action: string;
    required: boolean;
    status: "not-required" | "required-not-granted" | "granted";
  }>;
  receiptRequired: true;
};

type AgentRouter = {
  routes: Array<{
    id: string;
    workflowId: string;
    makerPersonaId: string;
    verifierPersonaId: string;
    autonomyCeiling: AgentAssignment["autonomyLevel"];
    requestedActions: string[];
  }>;
};

export type GenerateAssignmentOptions = {
  id?: string;
  summary?: string;
  risk?: AgentAssignment["risk"];
  routeId?: string;
  allowedPaths?: string[];
  output?: string;
};

export type GenerateAssignmentResult =
  | { ok: true; file: string; assignment: AgentAssignment }
  | { ok: false; errors: string[] };

export async function generateAgentAssignment(
  repoRoot: string,
  options: GenerateAssignmentOptions = {}
): Promise<GenerateAssignmentResult> {
  const templatePath = path.join(repoRoot, "contracts/agent-governance/assignments/scoped-change.json");
  const routerPath = path.join(repoRoot, "contracts/agent-governance/router.json");
  const template = JSON.parse(await readFile(templatePath, "utf8")) as AgentAssignment;
  const router = JSON.parse(await readFile(routerPath, "utf8")) as AgentRouter;
  const routeId = options.routeId ?? template.routeId;
  const route = router.routes.find((candidate) => candidate.id === routeId);

  if (!route) {
    return { ok: false, errors: [`unknown route: ${routeId}`] };
  }

  const assignment: AgentAssignment = {
    ...template,
    id: options.id ?? template.id,
    summary: options.summary ?? template.summary,
    risk: options.risk ?? template.risk,
    routeId,
    workflowId: route.workflowId,
    makerPersonaId: route.makerPersonaId,
    verifierPersonaId: route.verifierPersonaId,
    autonomyLevel: route.autonomyCeiling,
    requestedActions: [...route.requestedActions],
    allowedPaths: options.allowedPaths?.length ? options.allowedPaths : template.allowedPaths
  };

  const output = options.output ?? path.join(".agent-runs", assignment.id, "assignment.json");
  const outputFile = path.resolve(repoRoot, output);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(assignment, null, 2)}\n`);

  const validation = await validateAgentAssignmentFile(repoRoot, output);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  return { ok: true, file: outputFile, assignment };
}
