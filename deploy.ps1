# GitHub Pages 部署脚本
# 用法：.\deploy.ps1 -RepoUrl "https://github.com/USERNAME/REPO.git" -CommitMsg "update blog"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,
    [string]$CommitMsg = "Update blog - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"
$blogPublic = "C:\Users\1\.easyclaw\workspace-caishen\projects\blog\public"
$deployDir = "C:\Users\1\.easyclaw\workspace-caishen\projects\blog\deploy-temp"

Write-Host "=== 财神博客 → GitHub Pages 部署 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 清理临时目录
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# 2. 复制public文件到临时目录
Write-Host "📁 复制博客文件..." -ForegroundColor Yellow
Copy-Item -Path "$blogPublic\*" -Destination $deployDir -Recurse -Force

# 3. 初始化git
Write-Host "🔧 初始化Git仓库..." -ForegroundColor Yellow
Set-Location $deployDir
git init
git config user.name "caishen-ai"
git config user.email "caishen@ai-money-blog.com"

# 4. 添加并提交
Write-Host "📝 提交文件..." -ForegroundColor Yellow
git add -A
git commit -m $CommitMsg

# 5. 推送到GitHub
Write-Host "🚀 推送到GitHub..." -ForegroundColor Yellow
git branch -M main
git remote add origin $RepoUrl
git push -u origin main --force

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "GitHub Pages URL: 等GitHub自动构建后可用" -ForegroundColor Cyan

# 6. 清理
Set-Location "C:\Users\1\.easyclaw\workspace-caishen"
Remove-Item -Recurse -Force $deployDir -ErrorAction SilentlyContinue
