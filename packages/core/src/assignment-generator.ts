import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { sha256Text } from "./file-utils.js";
import { validateAgentAssignmentFile } from "./validate-governance.js";

type AgentAssignment = {
  schema: "agent-assignment";
  id: string;
  lifecycle: string;
  ownedBy: string;
  taskType: "implementation" | "docs" | "test" | "refactor" | "content" | "research";
  owner: string;
  reviewer: string;
  summary: string;
  risk: "low" | "medium" | "high" | "critical";
  routeId: string;
  workflowId: string;
  makerPersonaId: string;
  verifierPersonaId: string;
  autonomyLevel: "A0" | "A1" | "A2" | "A3" | "A4";
  allowedPaths: string[];
  forbiddenPaths: string[];
  doNotTouchPaths: string[];
  dependencies: string[];
  blockedBy: string[];
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
    priority: number;
    matches: {
      taskTypes: string[];
      riskMarkers: string[];
      forbiddenRiskMarkers: string[];
    };
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
  taskType?: AgentAssignment["taskType"];
  riskMarkers?: string[];
  routeId?: string;
  owner?: string;
  reviewer?: string;
  allowedPaths?: string[];
  doNotTouchPaths?: string[];
  dependencies?: string[];
  blockedBy?: string[];
  output?: string;
};

export type GenerateAssignmentResult =
  | { ok: true; file: string; markdownFile: string; assignment: AgentAssignment }
  | { ok: false; errors: string[] };

export async function generateAgentAssignment(
  repoRoot: string,
  options: GenerateAssignmentOptions = {}
): Promise<GenerateAssignmentResult> {
  const templatePath = path.join(repoRoot, "contracts/agent-governance/assignments/scoped-change.json");
  const routerPath = path.join(repoRoot, "contracts/agent-governance/router.json");
  const template = JSON.parse(await readFile(templatePath, "utf8")) as AgentAssignment;
  const router = JSON.parse(await readFile(routerPath, "utf8")) as AgentRouter;
  const taskType = options.taskType ?? template.taskType ?? "implementation";
  const riskMarkers = options.riskMarkers?.length ? options.riskMarkers : ["local-write"];
  const routeId = options.routeId ?? selectRoute(router, taskType, riskMarkers)?.id ?? template.routeId;
  const route = router.routes.find((candidate) => candidate.id === routeId);

  if (!route) {
    return { ok: false, errors: [`unknown route: ${routeId}`] };
  }

  const assignment: AgentAssignment = {
    ...template,
    id: options.id ?? deterministicAssignmentId(options.summary ?? template.summary, taskType, repoRoot),
    taskType,
    owner: options.owner ?? template.owner ?? template.ownedBy,
    reviewer: options.reviewer ?? template.reviewer ?? "human-review",
    summary: options.summary ?? template.summary,
    risk: options.risk ?? template.risk,
    routeId,
    workflowId: route.workflowId,
    makerPersonaId: route.makerPersonaId,
    verifierPersonaId: route.verifierPersonaId,
    autonomyLevel: route.autonomyCeiling,
    requestedActions: [...route.requestedActions],
    allowedPaths: options.allowedPaths?.length ? options.allowedPaths : template.allowedPaths,
    doNotTouchPaths: options.doNotTouchPaths?.length ? options.doNotTouchPaths : template.doNotTouchPaths ?? template.forbiddenPaths,
    dependencies: options.dependencies ?? template.dependencies ?? [],
    blockedBy: options.blockedBy ?? template.blockedBy ?? []
  };

  const output = options.output ?? path.join(".agent-runs", assignment.id, "assignment.json");
  const outputFile = path.resolve(repoRoot, output);
  const markdownFile = outputFile.replace(/\.json$/, ".md");
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(assignment, null, 2)}\n`);
  await writeFile(markdownFile, renderAssignmentMarkdown(assignment));

  const validation = await validateAgentAssignmentFile(repoRoot, output);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  return { ok: true, file: outputFile, markdownFile, assignment };
}

function selectRoute(
  router: AgentRouter,
  taskType: AgentAssignment["taskType"],
  riskMarkers: string[]
): AgentRouter["routes"][number] | undefined {
  return [...router.routes]
    .sort((left, right) => right.priority - left.priority)
    .find((route) => {
      const taskAliases = taskType === "docs" ? ["docs", "documentation"] : [taskType];
      const hasTask = taskAliases.some((candidate) => route.matches.taskTypes.includes(candidate));
      const hasRequiredRisk = route.matches.riskMarkers.every((marker) => riskMarkers.includes(marker));
      const hasForbiddenRisk = riskMarkers.some((marker) => route.matches.forbiddenRiskMarkers.includes(marker));
      return hasTask && hasRequiredRisk && !hasForbiddenRisk;
    });
}

function deterministicAssignmentId(summary: string, taskType: string, repoRoot: string): string {
  const revision = execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8"
  }).trim();
  const digest = sha256Text(`${summary}\n${taskType}\n${revision}`).slice(0, 10);
  return `run-${taskType}-${digest}`;
}

function renderAssignmentMarkdown(assignment: AgentAssignment): string {
  return [
    `# Assignment: ${assignment.id}`,
    "",
    `- Summary: ${assignment.summary}`,
    `- Task type: ${assignment.taskType}`,
    `- Risk: ${assignment.risk}`,
    `- Route: ${assignment.routeId}`,
    `- Owner: ${assignment.owner}`,
    `- Reviewer: ${assignment.reviewer}`,
    `- Autonomy: ${assignment.autonomyLevel}`,
    "",
    "## Allowed Paths",
    ...assignment.allowedPaths.map((item) => `- ${item}`),
    "",
    "## Do Not Touch",
    ...assignment.doNotTouchPaths.map((item) => `- ${item}`),
    "",
    "## Expected Checks",
    ...assignment.expectedChecks.map((item) => `- ${item}`),
    ""
  ].join("\n");
}
