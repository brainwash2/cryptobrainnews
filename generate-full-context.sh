#!/bin/bash

OUTPUT="gemini-context.txt"

echo "=== CRYPTOBRAINNEWS FULL CONTEXT ===" > "$OUTPUT"
echo "Generated: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Folder structure (excluding node_modules, .next, .git, hidden)
echo "========== FOLDER STRUCTURE ==========" >> "$OUTPUT"
find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/\.*" | sort >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Root files (exclude large/unnecessary files and manual ones)
echo "========== ROOT FILES ==========" >> "$OUTPUT"
for f in $(find . -maxdepth 1 -type f \( -name "*.md" -o -name "*.txt" -o -name "*.ts" -o -name "*.mjs" -o -name "*.cjs" -o -name "*.json" -o -name "*.sql" -o -name "*.sh" -o -name "*.config.js" -o -name "*.config.ts" -o -name ".*.example" \) ! -name "package-lock.json" ! -name ".env.local" ! -name "tsconfig.tsbuildinfo" ! -name "Scaling-solution.md" ! -name "upgrade-data.md" ! -name "SECURITY_GUIDELINES.md" ! -name "SKILL.md" ! -name "claude.md" | sort); do
  echo "--- $(basename "$f") ---" >> "$OUTPUT"
  cat "$f" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

# Source code (src/)
echo "========== SOURCE CODE ==========" >> "$OUTPUT"
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | sort | while read f; do
  echo "--- $f ---" >> "$OUTPUT"
  cat "$f" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

# Docs folder
if [ -d "docs" ]; then
  echo "========== DOCS FOLDER ==========" >> "$OUTPUT"
  find docs -type f \( -name "*.md" -o -name "*.txt" \) | sort | while read f; do
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
fi

# Scripts folder (SQL schemas, .js/.ts utilities)
if [ -d "scripts" ]; then
  echo "========== SCRIPTS FOLDER ==========" >> "$OUTPUT"
  find scripts -type f \( -name "*.sql" -o -name "*.js" -o -name "*.ts" -o -name "*.cjs" \) | sort | while read f; do
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
fi

# Sanity folder (entire directory – schemas, configs, etc.)
if [ -d "sanity" ]; then
  echo "========== SANITY FOLDER ==========" >> "$OUTPUT"
  find sanity -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.tsx" \) | sort | while read f; do
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
fi

# Supabase SQL schemas (if any .sql files at root)
echo "========== SUPABASE SQL SCHEMAS ==========" >> "$OUTPUT"
for f in supabase*.sql; do
  if [ -f "$f" ]; then
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "✅ Generated $OUTPUT"
echo "📁 Size: $(du -h "$OUTPUT" | cut -f1)"
