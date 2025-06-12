@echo off
set NODE_OPTIONS=--no-warnings
npx tsx scripts/test-hf-service.ts
pause
