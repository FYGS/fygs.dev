#!/usr/bin/env pwsh
# Development server script for Windows
# Sets environment variables and runs Next.js dev server

$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NODE_ENV = "development"

Write-Host "Starting Next.js development server with optimized settings..." -ForegroundColor Green
Write-Host "NODE_OPTIONS: $env:NODE_OPTIONS" -ForegroundColor Gray

pnpm exec next dev --turbopack
