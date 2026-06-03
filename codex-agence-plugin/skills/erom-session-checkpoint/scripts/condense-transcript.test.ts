import { test, expect } from "bun:test";
import { condense } from "./condense-transcript";

test("ignore les types de lignes non user/assistant", () => {
  const jsonl = [
    JSON.stringify({ type: "attachment", message: {} }),
    JSON.stringify({ type: "file-history-snapshot" }),
    JSON.stringify({ type: "user", message: { role: "user", content: "salut" } }),
  ].join("\n");
  const out = condense(jsonl);
  expect(out).toContain("salut");
  expect(out).not.toContain("file-history-snapshot");
});

test("garde text + thinking, réduit tool_use à un marqueur", () => {
  const jsonl = JSON.stringify({ type: "assistant", message: { role: "assistant", content: [
    { type: "thinking", thinking: "je pèse X vs Y" },
    { type: "text", text: "voici la réponse" },
    { type: "tool_use", name: "Bash", input: { command: "ls -la" } },
  ]}});
  const out = condense(jsonl);
  expect(out).toContain("je pèse X vs Y");
  expect(out).toContain("voici la réponse");
  expect(out).toContain("[tool: Bash");
});

test("tronque les gros tool_result, garde les petits", () => {
  const jsonl = [
    JSON.stringify({ type: "user", message: { role: "user", content: [
      { type: "tool_result", content: "x".repeat(2000) } ]}}),
    JSON.stringify({ type: "user", message: { role: "user", content: [
      { type: "tool_result", content: "court" } ]}}),
  ].join("\n");
  const out = condense(jsonl);
  expect(out).toContain("court");
  expect(out).not.toContain("x".repeat(2000));
  expect(out).toMatch(/\[result:/);
});

test("gère content string ET array", () => {
  const jsonl = [
    JSON.stringify({ type: "user", message: { role: "user", content: "msg string" } }),
    JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "msg array" }] } }),
  ].join("\n");
  const out = condense(jsonl);
  expect(out).toContain("msg string");
  expect(out).toContain("msg array");
});

test("préfixe ## USER / ## ASSISTANT et ignore le JSON malformé", () => {
  const jsonl = ["{pas du json", JSON.stringify({ type: "user", message: { role: "user", content: "hello" } })].join("\n");
  const out = condense(jsonl);
  expect(out).toMatch(/## USER/);
  expect(out).toContain("hello");
});
