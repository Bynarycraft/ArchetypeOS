$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

function Login-Session($email, $password, $callback) {
  $ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $csrf = (Invoke-RestMethod -Uri ($base + '/api/auth/csrf') -WebSession $ws -TimeoutSec 20).csrfToken
  $body = 'csrfToken=' + [uri]::EscapeDataString($csrf) +
    '&email=' + [uri]::EscapeDataString($email) +
    '&password=' + [uri]::EscapeDataString($password) +
    '&callbackUrl=' + [uri]::EscapeDataString($callback) +
    '&json=true'
  Invoke-WebRequest -Uri ($base + '/api/auth/callback/credentials?json=true') -Method POST -ContentType 'application/x-www-form-urlencoded' -Body $body -WebSession $ws -TimeoutSec 20 | Out-Null
  return $ws
}

$adminWs = Login-Session 'admin@archetype.local' 'admin123' ($base + '/admin/dashboard')
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$coursePayload = @{
  title = "Temp Security Course $ts"
  description = 'Temporary course for enrollment gate verification'
  difficulty = 'beginner'
  contentType = 'text'
  content = 'Temp content'
  duration = 5
} | ConvertTo-Json

$course = Invoke-RestMethod -Uri ($base + '/api/courses') -Method POST -ContentType 'application/json' -Body $coursePayload -WebSession $adminWs -TimeoutSec 20

$testPayload = '{"courseId":"' + $course.id + '","title":"Temp Security Test","type":"mcq","timeLimit":5,"passingScore":70,"gradingType":"auto","questions":[{"question":"1+1?","options":["1","2","3"],"correct":1}]}'
$test = Invoke-RestMethod -Uri ($base + '/api/tests') -Method POST -ContentType 'application/json' -Body $testPayload -WebSession $adminWs -TimeoutSec 20

$candidateWs = Login-Session 'candidate@archetype.local' 'candidate123' ($base + '/tests')

$submitPayload = '{"answers":{"0":1}}'
$submitStatus = ''
$submitBody = ''

try {
  $submit = Invoke-WebRequest -Uri ($base + '/api/tests/' + $test.id + '/submit') -Method POST -ContentType 'application/json' -Body $submitPayload -WebSession $candidateWs -TimeoutSec 20
  $submitStatus = [string]$submit.StatusCode
} catch {
  if ($_.Exception.Response) {
    $submitStatus = [string]$_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $submitBody = $reader.ReadToEnd()
  } else {
    $submitStatus = 'error'
    $submitBody = $_.Exception.Message
  }
}

$deleteStatus = ''
try {
  $delete = Invoke-WebRequest -Uri ($base + '/api/courses/' + $course.id) -Method DELETE -WebSession $adminWs -TimeoutSec 20
  $deleteStatus = [string]$delete.StatusCode
} catch {
  if ($_.Exception.Response) {
    $deleteStatus = [string]$_.Exception.Response.StatusCode.value__
  } else {
    $deleteStatus = 'error'
  }
}

Write-Output ('temp-course=' + $course.id)
Write-Output ('temp-test=' + $test.id)
Write-Output ('candidate-submit-status=' + $submitStatus)
if ($submitBody) { Write-Output ('candidate-submit-body=' + $submitBody) }
Write-Output ('cleanup-course-delete-status=' + $deleteStatus)
