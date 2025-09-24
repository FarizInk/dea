import { $ } from "bun";

async function checkFormattingAndLinting() {
  try {
    console.info("🔍 Checking TypeScript formatting...");
    await $`bunx prettier --check "**/*.{ts,tsx}"`;

    console.info("🔍 Checking TypeScript linting...");
    await $`bunx eslint "**/*.{ts,tsx}" --max-warnings=0`;

    console.info("✅ TypeScript formatting and linting checks passed!");
  } catch {
    console.error("❌ Formatting or linting issues detected.");
    process.exit(1);
  }
}

checkFormattingAndLinting();
