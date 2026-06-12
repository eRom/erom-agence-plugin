import { test, expect } from "bun:test";
import { condense } from "./condense-transcript";

test("ignore les types de lignes non concernées", () => {
  const jsonl = [
    JSON.stringify({ type: "SYSTEM", status: "DONE" }),
    JSON.stringify({ type: "USER_INPUT", content: "salut" }),
  ].join("\n");
  const out = condense(jsonl);
  expect(out).toContain("salut");
  expect(out).not.toContain("SYSTEM");
});

test("garde text + thinking, réduit tool_use à un marqueur et filtre toolAction/toolSummary", () => {
  const jsonl = JSON.stringify({
    type: "PLANNER_RESPONSE",
    thinking: "je pèse X vs Y",
    content: "voici la réponse",
    tool_calls: [{ name: "run_command", args: { CommandLine: "\"ls -la\"", toolAction: "Action", toolSummary: "Summary" } }]
  });
  const out = condense(jsonl);
  expect(out).toContain("je pèse X vs Y");
  expect(out).toContain("voici la réponse");
  expect(out).toContain("[tool: run_command(CommandLine=ls -la)]");
  expect(out).not.toContain("toolAction");
  expect(out).not.toContain("toolSummary");
});

test("masque CodeContent et ArtifactMetadata par leur taille", () => {
  const jsonl = JSON.stringify({
    type: "PLANNER_RESPONSE",
    content: "code",
    tool_calls: [{ name: "write_to_file", args: { TargetFile: "\"path.ts\"", CodeContent: "const a = 1;" } }]
  });
  const out = condense(jsonl);
  expect(out).toContain("[tool: write_to_file(TargetFile=path.ts, CodeContent=<12 c>)]");
});

test("tronque les gros tool_result et supprime les urls de grounding", () => {
  const jsonl = [
    JSON.stringify({ source: "MODEL", type: "search_web", status: "DONE", content: "ligne 1\nligne 2\nligne 3\nligne 4\nligne 5\nligne 6\nligne 7\nligne 8\nligne 9\n[1] [antigravity.google](https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc)\nligne 11\n" + "x".repeat(600) }),
  ].join("\n");
  const out = condense(jsonl);
  expect(out).not.toContain("grounding-api-redirect");
  expect(out).toContain("ligne 1");
  expect(out).toContain("[result:");
});

test("préfixe ## USER / ## ASSISTANT et ignore le JSON malformé", () => {
  const jsonl = ["{pas du json", JSON.stringify({ type: "USER_INPUT", content: "hello" })].join("\n");
  const out = condense(jsonl);
  expect(out).toMatch(/## USER/);
  expect(out).toContain("hello");
});
