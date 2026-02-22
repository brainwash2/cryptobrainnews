#!/bin/bash

OUTPUT_FILE="full-code-context.txt"

echo "🔍 Generating full code context..."

{
    echo "========================================="
    echo "CRYPTOBRAINNEWS - COMPLETE CODE CONTEXT"
    echo "Generated: $(date)"
    echo "========================================="
    echo ""

    # 1. Folder structure (tree if available, else find fallback)
    echo "========== FOLDER STRUCTURE =========="
    echo ""
    if command -v tree &> /dev/null; then
        tree -I 'node_modules|.next|dist|.git|.env*' --dirsfirst
    else
        echo "tree command not found – using find fallback:"
        find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/.env*" | sort | sed -e 's/[^-][^\/]*\//──/g' -e 's/──/  /g' -e 's/^/  /'
    fi
    echo ""
    echo ""

    # 2. DUNE_QUERIES.md
    echo "========== DUNE QUERIES =========="
    echo ""
    if [ -f "DUNE_QUERIES.md" ]; then
        cat DUNE_QUERIES.md
    else
        echo "DUNE_QUERIES.md not found"
    fi
    echo ""
    echo ""

    # 3. Supabase complete schema (from previous step)
    echo "========== SUPABASE COMPLETE SCHEMA =========="
    echo ""
    if [ -f "supabase_complete_schema.sql" ]; then
        cat supabase_complete_schema.sql
    else
        echo "supabase_complete_schema.sql not found – please run the Supabase schema dump first."
    fi
    echo ""
    echo ""

    # 4. All source code from src/
    echo "========== SOURCE CODE (src/) =========="
    echo ""
    find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.json" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | sort | while read file; do
        echo "--- FILE: $file ---"
        echo ""
        cat "$file"
        echo ""
        echo ""
    done

    # 5. Root configuration files
    echo "========== CONFIG FILES =========="
    echo ""
    for file in next.config.ts next.config.mjs package.json tsconfig.json tailwind.config.ts postcss.config.mjs eslint.config.mjs .env.example; do
        if [ -f "$file" ]; then
            echo "--- $file ---"
            echo ""
            cat "$file"
            echo ""
            echo ""
        fi
    done

    # 6. Sentry configuration files
    echo "========== SENTRY CONFIGS =========="
    echo ""
    for file in sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts; do
        if [ -f "$file" ]; then
            echo "--- $file ---"
            echo ""
            cat "$file"
            echo ""
            echo ""
        fi
    done

    # 7. Other important files (middleware, instrumentation, etc.)
    for file in middleware.ts instrumentation.ts; do
        if [ -f "$file" ]; then
            echo "--- $file ---"
            echo ""
            cat "$file"
            echo ""
            echo ""
        fi
    done

    echo "========================================="
    echo "END OF CONTEXT"
    echo "========================================="

} > "$OUTPUT_FILE"

echo "✅ Context generated: $OUTPUT_FILE"
echo "📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo "🔍 You can now upload this to Claude 4.6 Opus via ZenMux.ai"
