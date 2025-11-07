# PowerShell script to fix all dark: variant classes to use static dark theme colors
# This eliminates browser-specific color inversion issues

Write-Host "Starting dark mode classes fix..." -ForegroundColor Cyan

# Define replacement mappings - from light mode class + dark: variant to just dark theme class
$replacements = @(
    # Border colors
    @{ Pattern = 'border-slate-200\s+dark:border-slate-700'; Replacement = 'border-slate-700' }
    @{ Pattern = 'border-slate-300\s+dark:border-slate-600'; Replacement = 'border-slate-600' }
    @{ Pattern = 'border-gray-300\s+dark:border-gray-600'; Replacement = 'border-gray-600' }
    @{ Pattern = 'border-emerald-200\s+dark:border-emerald-700'; Replacement = 'border-emerald-700' }
    
    # Background colors
    @{ Pattern = 'bg-emerald-100\s+text-emerald-800\s+border-emerald-200\s+dark:bg-emerald-900\s+dark:text-emerald-200\s+dark:border-emerald-700'; Replacement = 'bg-emerald-900 text-emerald-200 border-emerald-700' }
    @{ Pattern = 'bg-white\s+dark:bg-gray-800'; Replacement = 'bg-gray-800' }
    @{ Pattern = 'bg-white\s+dark:bg-background'; Replacement = 'bg-background' }
    @{ Pattern = 'bg-gray-50\s+dark:bg-gray-900'; Replacement = 'bg-gray-900' }
    @{ Pattern = 'bg-gray-100\s+dark:bg-gray-900'; Replacement = 'bg-gray-900' }
    @{ Pattern = 'bg-gray-100\s+dark:bg-gray-800'; Replacement = 'bg-gray-800' }
    @{ Pattern = 'bg-slate-100\s+dark:bg-slate-800'; Replacement = 'bg-slate-800' }
    @{ Pattern = 'bg-slate-50\s+dark:bg-slate-900'; Replacement = 'bg-slate-900' }
    @{ Pattern = 'bg-blue-100\s+dark:bg-blue-900/20'; Replacement = 'bg-blue-900/20' }
    @{ Pattern = 'bg-blue-100\s+dark:bg-blue-900/30'; Replacement = 'bg-blue-900/30' }
    @{ Pattern = 'bg-red-50\s+dark:bg-red-900/10'; Replacement = 'bg-red-900/10' }
    
    # Badge/Tag colors - Green
    @{ Pattern = 'bg-green-100\s+text-green-800\s+dark:bg-green-900/30\s+dark:text-green-400'; Replacement = 'bg-green-900/30 text-green-400' }
    @{ Pattern = 'bg-green-50\s+dark:bg-green-900/20'; Replacement = 'bg-green-900/20' }
    
    # Badge/Tag colors - Yellow
    @{ Pattern = 'bg-yellow-100\s+text-yellow-800\s+dark:bg-yellow-900/30\s+dark:text-yellow-400'; Replacement = 'bg-yellow-900/30 text-yellow-400' }
    @{ Pattern = 'bg-yellow-50\s+dark:bg-yellow-900/20'; Replacement = 'bg-yellow-900/20' }
    @{ Pattern = 'bg-yellow-200\s+dark:bg-yellow-800'; Replacement = 'bg-yellow-800' }
    @{ Pattern = 'bg-amber-100\s+dark:bg-amber-900/30'; Replacement = 'bg-amber-900/30' }
    
    # Badge/Tag colors - Red
    @{ Pattern = 'bg-red-100\s+text-red-800\s+dark:bg-red-900/30\s+dark:text-red-400'; Replacement = 'bg-red-900/30 text-red-400' }
    @{ Pattern = 'bg-red-50\s+dark:bg-red-900/20'; Replacement = 'bg-red-900/20' }
    @{ Pattern = 'bg-red-100\s+dark:bg-red-900/30'; Replacement = 'bg-red-900/30' }
    
    # Badge/Tag colors - Blue
    @{ Pattern = 'bg-blue-50\s+dark:bg-blue-900/20'; Replacement = 'bg-blue-900/20' }
    @{ Pattern = 'bg-indigo-100\s+dark:bg-indigo-900/30'; Replacement = 'bg-indigo-900/30' }
    
    # Badge/Tag colors - Gray
    @{ Pattern = 'bg-gray-100\s+text-gray-800\s+dark:bg-gray-800\s+dark:text-gray-300'; Replacement = 'bg-gray-800 text-gray-300' }
    
    # Text colors
    @{ Pattern = 'text-slate-900\s+dark:text-slate-100'; Replacement = 'text-slate-100' }
    @{ Pattern = 'text-slate-700\s+dark:text-slate-300'; Replacement = 'text-slate-300' }
    @{ Pattern = 'text-slate-600\s+dark:text-slate-400'; Replacement = 'text-slate-400' }
    @{ Pattern = 'text-slate-600\s+dark:text-slate-300'; Replacement = 'text-slate-300' }
    @{ Pattern = 'text-gray-900\s+dark:text-gray-100'; Replacement = 'text-gray-100' }
    @{ Pattern = 'text-gray-800\s+dark:text-gray-200'; Replacement = 'text-gray-200' }
    @{ Pattern = 'text-gray-700\s+dark:text-gray-300'; Replacement = 'text-gray-300' }
    @{ Pattern = 'text-gray-600\s+dark:text-gray-400'; Replacement = 'text-gray-400' }
    @{ Pattern = 'text-blue-600\s+dark:text-blue-400'; Replacement = 'text-blue-400' }
    @{ Pattern = 'text-green-600\s+dark:text-green-400'; Replacement = 'text-green-400' }
    @{ Pattern = 'text-green-700\s+dark:text-green-300'; Replacement = 'text-green-300' }
    @{ Pattern = 'text-red-600\s+dark:text-red-400'; Replacement = 'text-red-400' }
    @{ Pattern = 'text-red-700\s+dark:text-red-300'; Replacement = 'text-red-300' }
    @{ Pattern = 'text-yellow-700\s+dark:text-yellow-300'; Replacement = 'text-yellow-300' }
    @{ Pattern = 'text-amber-700\s+dark:text-amber-300'; Replacement = 'text-amber-300' }
    @{ Pattern = 'text-indigo-700\s+dark:text-indigo-300'; Replacement = 'text-indigo-300' }
    @{ Pattern = 'text-blue-700\s+dark:text-blue-300'; Replacement = 'text-blue-300' }
    
    # Hover states
    @{ Pattern = 'hover:bg-gray-50\s+dark:hover:bg-gray-700'; Replacement = 'hover:bg-gray-700' }
    @{ Pattern = 'hover:bg-blue-200\s+dark:hover:bg-blue-900/50'; Replacement = 'hover:bg-blue-900/50' }
    @{ Pattern = 'hover:bg-red-200\s+dark:hover:bg-red-900/50'; Replacement = 'hover:bg-red-900/50' }
    @{ Pattern = 'hover:bg-green-200\s+dark:hover:bg-green-900/50'; Replacement = 'hover:bg-green-900/50' }
    @{ Pattern = 'hover:bg-gray-200\s+dark:hover:bg-gray-700'; Replacement = 'hover:bg-gray-700' }
    @{ Pattern = 'hover:text-slate-800\s+dark:hover:text-slate-200'; Replacement = 'hover:text-slate-200' }
    @{ Pattern = 'hover:bg-purple-50\s+dark:hover:bg-purple-950'; Replacement = 'hover:bg-purple-950' }
    @{ Pattern = 'hover:bg-orange-50\s+dark:hover:bg-orange-950'; Replacement = 'hover:bg-orange-950' }
    
    # Prose and special classes
    @{ Pattern = 'prose-sm\s+max-w-none\s+dark:prose-invert'; Replacement = 'prose-sm max-w-none prose-invert' }
    @{ Pattern = 'prose\s+prose-sm\s+max-w-none\s+dark:prose-invert'; Replacement = 'prose prose-sm max-w-none prose-invert' }
    
    # Stroke and fill
    @{ Pattern = 'stroke-slate-300\s+dark:stroke-slate-600'; Replacement = 'stroke-slate-600' }
    @{ Pattern = 'fill-slate-400\s+dark:fill-slate-500'; Replacement = 'fill-slate-500' }
    
    # Complex button patterns
    @{ Pattern = 'bg-blue-100\s+text-blue-700\s+hover:bg-blue-200\s+dark:bg-blue-900/30\s+dark:text-blue-400\s+dark:hover:bg-blue-900/50'; Replacement = 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' }
    @{ Pattern = 'bg-red-100\s+text-red-700\s+hover:bg-red-200\s+dark:bg-red-900/30\s+dark:text-red-400\s+dark:hover:bg-red-900/50'; Replacement = 'bg-red-900/30 text-red-400 hover:bg-red-900/50' }
    @{ Pattern = 'bg-green-100\s+text-green-700\s+hover:bg-green-200\s+dark:bg-green-900/30\s+dark:text-green-400\s+dark:hover:bg-green-900/50'; Replacement = 'bg-green-900/30 text-green-400 hover:bg-green-900/50' }
    @{ Pattern = 'bg-gray-100\s+text-gray-700\s+hover:bg-gray-200\s+dark:bg-gray-800\s+dark:text-gray-300\s+dark:hover:bg-gray-700'; Replacement = 'bg-gray-800 text-gray-300 hover:bg-gray-700' }
    
    # Border patterns for billing
    @{ Pattern = 'border-purple-300\s+text-purple-700\s+hover:bg-purple-50\s+dark:border-purple-600\s+dark:text-purple-400\s+dark:hover:bg-purple-950'; Replacement = 'border-purple-600 text-purple-400 hover:bg-purple-950' }
    @{ Pattern = 'border-orange-300\s+text-orange-700\s+hover:bg-orange-50\s+dark:border-orange-600\s+dark:text-orange-400\s+dark:hover:bg-orange-950'; Replacement = 'border-orange-600 text-orange-400 hover:bg-orange-950' }
    
    # Select trigger
    @{ Pattern = 'border-gray-300\s+dark:border-gray-600\s+text-gray-900\s+dark:text-gray-100'; Replacement = 'border-gray-600 text-gray-100' }
    @{ Pattern = 'text-gray-900\s+dark:text-gray-100'; Replacement = 'text-gray-100' }
    
    # Badges with borders (complex patterns)
    @{ Pattern = 'bg-green-100\s+dark:bg-green-900/30\s+border\s+border-green-200\s+dark:border-green-800'; Replacement = 'bg-green-900/30 border border-green-800' }
    @{ Pattern = 'bg-amber-100\s+dark:bg-amber-900/30\s+border\s+border-amber-200\s+dark:border-amber-800'; Replacement = 'bg-amber-900/30 border border-amber-800' }
    @{ Pattern = 'bg-red-100\s+dark:bg-red-900/30\s+border\s+border-red-200\s+dark:border-red-800'; Replacement = 'bg-red-900/30 border border-red-800' }
    
    # Specific database visualization colors
    @{ Pattern = 'bg-blue-100\s+dark:bg-blue-900/30'; Replacement = 'bg-blue-900/30' }
    @{ Pattern = 'border-blue-200\s+dark:border-blue-800'; Replacement = 'border-blue-800' }
    @{ Pattern = 'text-blue-700\s+dark:text-blue-300'; Replacement = 'text-blue-300' }
    @{ Pattern = 'border-indigo-200\s+dark:border-indigo-800'; Replacement = 'border-indigo-800' }
    @{ Pattern = 'border-red-200\s+dark:border-red-800'; Replacement = 'border-red-800' }
    @{ Pattern = 'border-green-200\s+dark:border-green-800'; Replacement = 'border-green-800' }
    @{ Pattern = 'border-amber-200\s+dark:border-amber-800'; Replacement = 'border-amber-800' }
    @{ Pattern = 'border-slate-300\s+dark:border-slate-600'; Replacement = 'border-slate-600' }
    
    # Background with backdrop
    @{ Pattern = 'bg-white/80\s+dark:bg-slate-900/80'; Replacement = 'bg-slate-900/80' }
    
    # ACID visualization specific
    @{ Pattern = 'border-dashed\s+border-slate-300\s+dark:border-slate-600'; Replacement = 'border-dashed border-slate-600' }
    @{ Pattern = 'bg-green-50\s+dark:bg-green-900/20\s+border\s+border-green-200\s+dark:border-green-800'; Replacement = 'bg-green-900/20 border border-green-800' }
)

# Get all TypeScript and TSX files
$files = Get-ChildItem -Path "app", "components" -Include "*.tsx", "*.ts" -Recurse -File

$totalFiles = $files.Count
$modifiedFiles = 0
$totalReplacements = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Yellow

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($replacement in $replacements) {
        $pattern = $replacement.Pattern
        $newValue = $replacement.Replacement
        
        # Use regex to find and replace
        $matches = [regex]::Matches($content, $pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $pattern, $newValue
            $fileReplacements += $matches.Count
        }
    }
    
    # Check if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        $totalReplacements += $fileReplacements
        Write-Host "Modified: $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Dark mode fix completed!" -ForegroundColor Cyan
Write-Host "Modified files: $modifiedFiles / $totalFiles" -ForegroundColor Green
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
