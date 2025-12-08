#!/bin/bash
echo "Checking codebase for hardcoded API keys..."

# More specific patterns to catch actual hardcoded keys, not just variable names
KEY_PATTERNS='(syn_[a-zA-Z0-9]{20,}|mm_[a-zA-Z0-9]{20,}|sk-[a-zA-Z0-9]{20,})'

# Files that are expected to contain key-like strings (e.g., definitions, test placeholders)
EXCLUDE_FILES=(
  "src/config/types.ts" \
  "src/config/manager.ts" \
  "src/config/env.ts" \
  "src/config/test-config.ts" \
  "src/core/managers/setup-manager.ts" \
  "src/core/app.ts" \
  "src/core/managers/auth-manager.test.ts.disabled" \
  "src/launcher/claude-launcher.ts" \
)

# Construct the exclude arguments for grep
EXCLUDE_ARGS=""
for file in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_ARGS+=" --exclude='$file'"
done

# Run grep with the constructed exclude arguments, without eval
# We need to use sh -c to correctly interpret EXCLUDE_ARGS as multiple arguments
if sh -c "grep -r -E '$KEY_PATTERNS' src/ $EXCLUDE_ARGS"; then
  echo "ERROR: Hardcoded API keys found in codebase. Please remove them."
  exit 1
else
  echo "No hardcoded API keys found in codebase."
  exit 0
fi
