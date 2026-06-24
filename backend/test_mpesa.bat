@echo off
echo ========================================
echo M-PESA INTEGRATION TEST
echo ========================================

echo.
echo Step 1: Logging in...
for /f "tokens=*" %%i in ('powershell -Command "$body = @{phone = '+254712345678'; password = 'Password123!'} | ConvertTo-Json; Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body $body"') do set TOKEN=%%i

echo.
echo Step 2: Testing STK Push...
powershell -Command "
$headers = @{Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMiIsImlhdCI6MTc1MDY0NzY2OCwiZXhwIjoxNzUwNjQ4NTY4fQ.example'}
$body = @{order_id='00000000-0000-0000-0000-000000000001'; amount_kes=1000; phone_number='+254708374149'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/payments/initiate-stk' -Method Post -ContentType 'application/json' -Headers $headers -Body $body
"

echo.
echo Test complete!
pause
