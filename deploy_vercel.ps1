$envVars = @{
    "VITE_SUPABASE_URL" = "https://opxzdmvpmflurybnxwcg.supabase.co"
    "VITE_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weHpkbXZwbWZsdXJ5Ym54d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTM2NzksImV4cCI6MjEwMzA2OTY3OX0.zPlSpnl0E0uaKlG4hbxqSgR9Fiy-ji6sKBRKBoPK0Qc"
    "VITE_CLOUDINARY_CLOUD_NAME" = "sow5lifg"
    "VITE_CLOUDINARY_API_KEY" = "567413445899554"
    "VITE_CLOUDINARY_API_SECRET" = "EiI0u6hvEVnpNLO3oK8fRLq5q-8"
    "VITE_TURNSTILE_SITE_KEY" = "0x4AAAAAAEd9Ka4jZpcUF9Ls"
}

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Adding $key..."
    npx -y vercel env add $key production --value "$value" --yes --force
}

Write-Host "Deploying to Vercel..."
npx -y vercel deploy --prod --yes
