$ErrorActionPreference = 'Stop'

# Try to use Flutter SDK at C:\src\flutter if flutter is not available in PATH.
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  $flutterBin = 'C:\src\flutter\bin'
  if (Test-Path (Join-Path $flutterBin 'flutter.bat')) {
    $env:PATH = "$flutterBin;$env:PATH"
  }
}

Set-Location "$PSScriptRoot\..\mobile_app"
flutter pub get
flutter run
