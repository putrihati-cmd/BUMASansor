$ErrorActionPreference = 'Stop'

# Try to use Laragon's bundled Node.js if npm is not available in PATH.
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  $laragonNodeRoot = 'C:\laragon\bin\nodejs'
  if (Test-Path $laragonNodeRoot) {
    $nodeDir = Get-ChildItem -Path $laragonNodeRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
    if ($nodeDir) {
      $env:PATH = "$($nodeDir.FullName);$env:PATH"
    }
  }
}

Set-Location "$PSScriptRoot\..\backend"

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
}

npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
