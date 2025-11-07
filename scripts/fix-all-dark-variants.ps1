# Comprehensive dark: variant removal script for PowerShell v5
Write-Host "=== Comprehensive Dark Mode Fix ===" -ForegroundColor Cyan
Write-Host "Removing ALL dark: variants from the project..." -ForegroundColor Yellow

$replacements = @(
    # Admin header specific
    @{ Pattern = 'bg-red-500/10 text-red-700 dark:text-red-400'; Replace = 'bg-red-500/10 text-red-400' }
    @{ Pattern = 'bg-blue-500/10 text-blue-700 dark:text-blue-400'; Replace = 'bg-blue-500/10 text-blue-400' }
    @{ Pattern = 'bg-gray-500/10 text-gray-700 dark:text-gray-400'; Replace = 'bg-gray-500/10 text-gray-400' }
    @{ Pattern = 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700'; Replace = 'bg-slate-900 border-b border-slate-700' }
    @{ Pattern = 'bg-slate-50 dark:bg-slate-800'; Replace = 'bg-slate-800' }
    @{ Pattern = 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'; Replace = 'bg-blue-950/50 border border-blue-800' }
    @{ Pattern = 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'; Replace = 'bg-green-950/50 border border-green-800' }
    @{ Pattern = 'bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800'; Replace = 'bg-orange-950/50 border border-orange-800' }
    @{ Pattern = 'text-red-600 dark:text-red-400'; Replace = 'text-red-400' }
    
    # Theme toggle animations (keep for transition effects but use single state)
    @{ Pattern = 'rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'; Replace = 'rotate-0 scale-100 transition-all' }
    @{ Pattern = 'rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'; Replace = 'rotate-90 scale-0 transition-all' }
    
    # MDX/Markdown renderer
    @{ Pattern = 'text-slate-900 dark:text-white'; Replace = 'text-white' }
    @{ Pattern = 'from-slate-900 to-slate-700 dark:from-white dark:to-slate-300'; Replace = 'from-white to-slate-300' }
    @{ Pattern = 'text-slate-800 dark:text-slate-200'; Replace = 'text-slate-200' }
    @{ Pattern = 'bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200'; Replace = 'bg-slate-800 text-sm font-mono text-slate-200' }
    @{ Pattern = 'bg-slate-900 border border-slate-200 dark:border-slate-800'; Replace = 'bg-slate-900 border border-slate-800' }
    @{ Pattern = 'text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'; Replace = 'text-blue-400 hover:text-blue-300' }
    @{ Pattern = 'bg-blue-50 dark:bg-blue-950/30'; Replace = 'bg-blue-950/30' }
    @{ Pattern = 'from-transparent via-slate-300 to-transparent dark:via-slate-600'; Replace = 'from-transparent via-slate-600 to-transparent' }
    @{ Pattern = 'bg-slate-50 dark:bg-slate-800'; Replace = 'bg-slate-800' }
    @{ Pattern = 'divide-y divide-slate-200 dark:divide-slate-700'; Replace = 'divide-y divide-slate-700' }
    @{ Pattern = 'hover:bg-slate-50 dark:hover:bg-slate-800/50'; Replace = 'hover:bg-slate-800/50' }
    
    # TestComponent
    @{ Pattern = 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'; Replace = 'from-gray-900 to-gray-800' }
    @{ Pattern = 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'; Replace = 'text-blue-400 hover:text-blue-300' }
    @{ Pattern = 'text-gray-600 dark:text-gray-300'; Replace = 'text-gray-300' }
    @{ Pattern = 'text-gray-900 dark:text-white'; Replace = 'text-white' }
    @{ Pattern = 'text-blue-800 dark:text-blue-200'; Replace = 'text-blue-200' }
    @{ Pattern = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'; Replace = 'bg-gray-700 text-white' }
    @{ Pattern = 'hover:bg-gray-300 dark:hover:bg-gray-600'; Replace = 'hover:bg-gray-600' }
    
    # Error boundary & image upload
    @{ Pattern = 'bg-red-100 dark:bg-red-900/20'; Replace = 'bg-red-900/20' }
    @{ Pattern = 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'; Replace = 'border-blue-500 bg-blue-950/20' }
    @{ Pattern = 'hover:bg-slate-50 dark:hover:bg-slate-800/50'; Replace = 'hover:bg-slate-800/50' }
    @{ Pattern = 'bg-red-50 dark:bg-red-950/20'; Replace = 'bg-red-950/20' }
    @{ Pattern = 'text-red-700 dark:text-red-400'; Replace = 'text-red-400' }
    @{ Pattern = 'bg-green-50 dark:bg-green-950/20'; Replace = 'bg-green-950/20' }
    @{ Pattern = 'text-green-700 dark:text-green-400'; Replace = 'text-green-400' }
    
    # Review form
    @{ Pattern = 'from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'; Replace = 'from-blue-900/30 to-purple-900/30' }
    @{ Pattern = 'text-blue-900 dark:text-blue-200'; Replace = 'text-blue-200' }
    @{ Pattern = 'text-blue-800 dark:text-blue-300'; Replace = 'text-blue-300' }
    
    # Alert component
    @{ Pattern = 'border-destructive/50 text-destructive dark:border-destructive'; Replace = 'border-destructive/50 text-destructive' }
    
    # Playground CSS
    @{ Pattern = 'bg-white dark:bg-gray-800'; Replace = 'bg-gray-800' }
)

$filePatterns = @("*.tsx", "*.ts", "*.css")
$folders = @("app", "components", "styles")

$totalModified = 0
$filesProcessed = 0

foreach ($folder in $folders) {
    foreach ($pattern in $filePatterns) {
        $files = Get-ChildItem -Path $folder -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            $filesProcessed++
            $content = Get-Content $file.FullName -Encoding UTF8 | Out-String
            $originalContent = $content
            $fileModified = $false
            
            foreach ($rep in $replacements) {
                if ($content -match [regex]::Escape($rep.Pattern)) {
                    $content = $content -replace [regex]::Escape($rep.Pattern), $rep.Replace
                    $fileModified = $true
                }
            }
            
            if ($fileModified) {
                [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
                $totalModified++
                Write-Host "[FIXED] $($file.Name)" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Dark mode fix completed!" -ForegroundColor Green
Write-Host "Files processed: $filesProcessed" -ForegroundColor Yellow
Write-Host "Files modified: $totalModified" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
