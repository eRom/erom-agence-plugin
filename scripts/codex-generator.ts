import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "fs/promises";
import { basename, dirname, extname, join } from "path";

const CLAUDE_DIR = join(process.cwd(), "claude-agence-plugin");
const CODEX_DIR = join(process.cwd(), "codex-agence-plugin");

// Mappings des modèles
const MODEL_MAPPING: Record<string, string> = {
  haiku: "gpt-5.4-mini",
  sonnet: "gpt-5.4",
  opus: "gpt-5.5",
};

// Mappings des couleurs CSS simples en Hexa
const COLOR_MAPPING: Record<string, string> = {
  cyan: "#00FFFF",
  purple: "#800080",
  blue: "#0000FF",
  red: "#FF0000",
  green: "#008000",
  yellow: "#FFFF00",
  orange: "#FFA500",
};
