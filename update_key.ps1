$job = Start-Job -ScriptBlock {
    cd c:\pixelwind
    npx -y vercel env add VITE_TURNSTILE_SITE_KEY production --value "0x4AAAAAAEgeVQCHdekB-6OX" --yes --force
}
Wait-Job $job -Timeout 10
Stop-Job $job
Receive-Job $job
Remove-Job $job

Write-Host "Deploying..."
npx -y vercel deploy --prod --yes
