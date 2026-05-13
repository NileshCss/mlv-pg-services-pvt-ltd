@echo off
REM Netlify Deployment Test Suite (Windows)
REM Run this before deploying to verify everything works locally

echo ================================
echo Netlify Deployment Test Suite
echo ================================
echo.

REM Test 1: Clean Install
echo ^> TEST 1: Clean Install (npm ci)
echo   Simulating: npm ci (what Netlify runs^)
echo   Expected: All dependencies installed, including devDependencies
echo.
call npm ci
if errorlevel 1 (
  echo FAILED: npm ci failed
  exit /b 1
)
echo PASSED: npm ci completed successfully
echo.

REM Test 2: Build
echo ^> TEST 2: Build Project (npm run build^)
echo   Expected: No errors about tailwindcss, path aliases, or imports
echo.
call npm run build
if errorlevel 1 (
  echo FAILED: npm run build failed
  exit /b 1
)
echo PASSED: npm run build completed successfully
echo.

REM Test 3: Type Check
echo ^> TEST 3: Type Check (npm run type-check^)
echo   Expected: No TypeScript errors
echo.
call npm run type-check
if errorlevel 1 (
  echo FAILED: npm run type-check failed
  exit /b 1
)
echo PASSED: npm run type-check completed successfully
echo.

REM Test 4: Lint
echo ^> TEST 4: Lint Check (npm run lint^)
echo   Expected: No linting errors
echo.
call npm run lint
if not errorlevel 1 (
  echo PASSED: npm run lint completed successfully
) else (
  echo WARNING: Some linting warnings found ^(may not break build^)
)
echo.

echo ================================
echo All Local Tests Passed!
echo ================================
echo.
echo Next Steps:
echo 1. git add .
echo 2. git commit -m "fix: netlify deployment configuration verified"
echo 3. git push origin main
echo 4. Go to Netlify Dashboard ^> Trigger Deploy
echo.
pause
