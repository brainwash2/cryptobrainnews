#!/bin/bash

OUTPUT="gemini-context.txt"

echo "=== CRYPTOBRAINNEWS FULL CONTEXT ===" > "$OUTPUT"
echo "Generated: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Folder structure (excluding node_modules, .next, .git, hidden)
echo "========== FOLDER STRUCTURE ==========" >> "$OUTPUT"
find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/\.*" | sort >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Root files
echo "========== ROOT FILES ==========" >> "$OUTPUT"
for f in .env.example DUNE_QUERIES.md design_system.md task.md implementation-plan.md walkthrough.md package.json next.config.mjs tailwind.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs sentry.client.config.ts sentry.edge.config.ts sentry.server.config.ts README.md; do
  if [ -f "$f" ]; then
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

# Source code (src/)
echo "========== SOURCE CODE ==========" >> "$OUTPUT"
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | sort | while read f; do
  echo "--- $f ---" >> "$OUTPUT"
  cat "$f" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

# Docs folder (master prompts, editorial guides, etc.)
if [ -d "docs" ]; then
  echo "========== DOCS FOLDER ==========" >> "$OUTPUT"
  find docs -type f \( -name "*.md" -o -name "*.txt" \) | sort | while read f; do
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
fi

# Scripts folder (SQL schemas, etc.)
if [ -d "scripts" ]; then
  echo "========== SCRIPTS FOLDER ==========" >> "$OUTPUT"
  find scripts -type f -name "*.sql" | sort | while read f; do
    echo "--- $f ---" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
fi

# Sanity/supabase schemas if present (additional)
for s in sanity/schemaTypes/*.ts supabase_schema.sql supabase_schema_events_adleads.sql; do
  if [ -f "$s" ]; then
    echo "--- $s ---" >> "$OUTPUT"
    cat "$s" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "✅ Generated $OUTPUT"
echo "📁 Size: $(du -h "$OUTPUT" | cut -f1)"
