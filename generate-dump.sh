#!/bin/bash
OUTPUT="grok-context.txt"
echo "Generating project dump for Grok..."

echo "========== FOLDER STRUCTURE ==========" > $OUTPUT
find . -not -path "*/node_modules/*" -not -path "*/\.next/*" -not -path "*/\.git/*" -not -path "*/public/*" | sort >> $OUTPUT

echo -e "\n========== CONFIG FILES ==========" >> $OUTPUT
for file in package.json next.config.mjs tailwind.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs; do
  if [ -f "$file" ]; then
    echo -e "\n--- $file ---" >> $OUTPUT
    cat "$file" >> $OUTPUT
  fi
done

echo -e "\n========== DATABASE & QUERIES ==========" >> $OUTPUT
# Find all SQL schemas in the root or supabase folder, plus the Dune Queries doc
find . -maxdepth 2 -type f \( -name "*.sql" -o -name "DUNE_QUERIES.md" \) | sort | while read file; do
  echo -e "\n--- FILE: $file ---" >> $OUTPUT
  cat "$file" >> $OUTPUT
done

echo -e "\n========== SOURCE CODE (src/) ==========" >> $OUTPUT
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) | sort | while read file; do
  echo -e "\n--- FILE: $file ---" >> $OUTPUT
  cat "$file" >> $OUTPUT
done

echo "Dump complete! You can now download or copy the contents of grok-context.txt"
