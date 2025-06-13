# .github/workflows/update-tour-data.yml
name: Update Tourism Data

on:
  schedule:
    - cron: '0 2 * * *'  # 매일 오전 2시 (KST 11시)
  workflow_dispatch:     # 수동 실행 가능

jobs:
  fetch-tour-data:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Create data directory
        run: mkdir -p data

      - name: Fetch Tourism Data
        env:
          TOUR_API_KEY: ${{ secrets.TOUR_API_KEY }}
        run: |
          node scripts/fetch-tour-data.js

      - name: Commit and push changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/*.json
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "Update tour data $(date '+%Y-%m-%d %H:%M:%S')"
            git push
          fi
