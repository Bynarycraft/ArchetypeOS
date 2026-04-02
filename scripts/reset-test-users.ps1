$ErrorActionPreference = 'Stop'

$project = 'C:\Users\BYNARYCRAFT\Desktop\archetypeos-mvp\talent-compass'

Write-Output 'Resetting seeded users and test data...'
Push-Location $project
try {
  npm run reset:test-users
  Write-Output 'Reset complete.'
  Write-Output 'Test accounts:'
  Write-Output '  admin@archetype.local / admin123'
  Write-Output '  supervisor@archetype.local / supervisor123'
  Write-Output '  learner1@archetype.local / learner123'
  Write-Output '  learner2@archetype.local / learner123'
  Write-Output '  candidate@archetype.local / candidate123'
} finally {
  Pop-Location
}
