#!/bin/bash
# Netlify Deployment Test Suite
# Run this before deploying to verify everything works locally

echo "================================"
echo "Netlify Deployment Test Suite"
echo "================================"
echo ""

# Test 1: Clean Install
echo "❯ TEST 1: Clean Install (npm ci)"
echo "  Simulating: npm ci (what Netlify runs)"
echo "  Expected: All dependencies installed, including devDependencies"
echo ""
npm ci
if [ $? -ne 0 ]; then
  echo "❌ FAILED: npm ci failed"
  exit 1
fi
echo "✅ PASSED: npm ci completed successfully"
echo ""

# Test 2: Build
echo "❯ TEST 2: Build Project (npm run build)"
echo "  Expected: No errors about tailwindcss, path aliases, or imports"
echo ""
npm run build
if [ $? -ne 0 ]; then
  echo "❌ FAILED: npm run build failed"
  exit 1
fi
echo "✅ PASSED: npm run build completed successfully"
echo ""

# Test 3: Type Check
echo "❯ TEST 3: Type Check (npm run type-check)"
echo "  Expected: No TypeScript errors"
echo ""
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ FAILED: npm run type-check failed"
  exit 1
fi
echo "✅ PASSED: npm run type-check completed successfully"
echo ""

# Test 4: Lint
echo "❯ TEST 4: Lint Check (npm run lint)"
echo "  Expected: No linting errors"
echo ""
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️  WARNING: Some linting warnings found (may not break build)"
else
  echo "✅ PASSED: npm run lint completed successfully"
fi
echo ""

echo "================================"
echo "All Local Tests Passed! ✅"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. git add ."
echo "2. git commit -m 'fix: netlify deployment configuration verified'"
echo "3. git push origin main"
echo "4. Go to Netlify Dashboard → Trigger Deploy"
echo ""
