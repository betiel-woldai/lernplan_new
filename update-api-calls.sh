#!/bin/bash

# Script to update all API fetch calls to use apiFetch helper

echo "Updating API calls in hooks..."

# List of files to update
FILES=(
  "src/hooks/useCalendarSessions.tsx"
  "src/hooks/useDashboardEvents.ts"
  "src/hooks/useLearningSessions.tsx"
  "src/hooks/useSessionStats.tsx"
  "src/hooks/useUserStats.tsx"
  "src/hooks/useActiveSession.tsx"
  "src/pages/index.tsx"
  "src/pages/analytics.tsx"
  "src/components/DirectCalendarStats.tsx"
  "src/components/GamificationProvider.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Add import if not already present
    if ! grep -q "import.*apiFetch.*from.*@/lib/apiClient" "$file"; then
      # Find the last import line and add after it
      sed -i "/^import/a import { apiFetch } from '@/lib/apiClient';" "$file"
    fi

    # Replace fetch with apiFetch
    sed -i "s/await fetch('/await apiFetch('/g" "$file"
    sed -i 's/await fetch(`/await apiFetch(`/g' "$file"
    sed -i "s/fetch('/apiFetch('/g" "$file"
    sed -i 's/fetch(`/apiFetch(`/g' "$file"

    echo "✓ Updated $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "Done! Updated all API calls to use apiFetch helper."
