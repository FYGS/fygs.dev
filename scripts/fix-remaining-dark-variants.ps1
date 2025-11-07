# Final cleanup script for remaining dark: variants
Write-Host "Fixing remaining dark: variants..." -ForegroundColor Yellow

$patterns = @(
    # Unauthorized page
    @{ Pattern = 'bg-yellow-100 dark:bg-yellow-900/20'; Replace = 'bg-yellow-900/20' }
    @{ Pattern = 'text-yellow-600 dark:text-yellow-400'; Replace = 'text-yellow-400' }
    
    # Offline page  
    @{ Pattern = 'bg-blue-100 dark:bg-blue-900/20'; Replace = 'bg-blue-900/20' }
    @{ Pattern = 'text-blue-600 dark:text-blue-400'; Replace = 'text-blue-400' }
    
    # Premium badge
    @{ Pattern = 'dark:from-purple-950/50 dark:to-indigo-950/50'; Replace = '' }
    @{ Pattern = 'text-purple-700 dark:text-purple-300'; Replace = 'text-purple-300' }
    @{ Pattern = 'border-purple-200 dark:border-purple-800'; Replace = 'border-purple-800' }
    @{ Pattern = 'dark:hover:from-purple-950/60 dark:hover:to-indigo-950/60'; Replace = '' }
    
    # Payment form
    @{ Pattern = 'text-green-800 dark:text-green-200'; Replace = 'text-green-200' }
    
    # Reply card
    @{ Pattern = 'text-green-600 bg-green-50 dark:bg-green-950'; Replace = 'text-green-400 bg-green-950' }
    @{ Pattern = 'text-red-600 bg-red-50 dark:bg-red-950'; Replace = 'text-red-400 bg-red-950' }
    
    # Notifications dropdown
    @{ Pattern = 'hover:bg-slate-50 dark:hover:bg-slate-800'; Replace = 'hover:bg-slate-800' }
    @{ Pattern = 'bg-blue-50 dark:bg-blue-950/20'; Replace = 'bg-blue-950/20' }
    
    # Search highlight
    @{ Pattern = 'bg-yellow-200 dark:bg-yellow-800'; Replace = 'bg-yellow-800' }
    
    # Templates
    @{ Pattern = 'border-gray-300 dark:border-neutral-700'; Replace = 'border-neutral-700' }
    
    # Database components
    @{ Pattern = 'bg-slate-100 dark:bg-slate-800'; Replace = 'bg-slate-800' }
    @{ Pattern = 'stroke-slate-300 dark:stroke-slate-600'; Replace = 'stroke-slate-600' }
    @{ Pattern = 'fill-slate-400 dark:fill-slate-500'; Replace = 'fill-slate-500' }
    @{ Pattern = 'bg-blue-100 dark:bg-blue-900/30'; Replace = 'bg-blue-900/30' }
    @{ Pattern = 'border-blue-200 dark:border-blue-800'; Replace = 'border-blue-800' }
    @{ Pattern = 'text-blue-700 dark:text-blue-300'; Replace = 'text-blue-300' }
    @{ Pattern = 'bg-indigo-100 dark:bg-indigo-900/30'; Replace = 'bg-indigo-900/30' }
    @{ Pattern = 'border-indigo-200 dark:border-indigo-800'; Replace = 'border-indigo-800' }
    @{ Pattern = 'text-indigo-700 dark:text-indigo-300'; Replace = 'text-indigo-300' }
    @{ Pattern = 'bg-red-100 dark:bg-red-900/30'; Replace = 'bg-red-900/30' }
    @{ Pattern = 'border-red-200 dark:border-red-800'; Replace = 'border-red-800' }
    @{ Pattern = 'text-red-700 dark:text-red-300'; Replace = 'text-red-300' }
)

$fileExtensions = @("*.tsx", "*.ts", "*.css")
$filesProcessed = 0
$filesModified = 0

foreach ($ext in $fileExtensions) {
    $files = Get-ChildItem -Path "." -Filter $ext -Recurse -File | 
             Where-Object { 
                 $_.FullName -notlike "*\node_modules\*" -and 
                 $_.FullName -notlike "*\.next\*" -and
                 $_.FullName -notlike "*\dist\*" -and
                 $_.FullName -notlike "*\docs\*" -and
                 $_.FullName -notlike "*\scripts\fix-*.ps1"
             }
    
    foreach ($file in $files) {
        $filesProcessed++
        $content = Get-Content $file.FullName | Out-String
        $originalContent = $content
        
        foreach ($replacement in $patterns) {
            $content = $content -replace [regex]::Escape($replacement.Pattern), $replacement.Replace
        }
        
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
            $filesModified++
        }
    }
}

Write-Host "`nProcessed $filesProcessed files" -ForegroundColor Cyan
Write-Host "Modified $filesModified files" -ForegroundColor Green
Write-Host "Dark mode fix completed!" -ForegroundColor Yellow
