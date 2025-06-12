@echo off
echo === IBM Quantum Setup Check ===
echo.

echo [1/4] Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

echo.
echo [2/4] Checking .env file...
if not exist .env (
    echo ❌ .env file not found
    echo Please create a .env file with your IBM Quantum API key
    echo IBM_QUANTUM_API_KEY=your_api_key_here
    exit /b 1
) else (
    echo ✅ Found .env file
)

echo.
echo [3/4] Checking API key in .env...
findstr /I "IBM_QUANTUM_API_KEY" .env >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ IBM_QUANTUM_API_KEY not found in .env
    echo Please add your IBM Quantum API key to the .env file
    echo IBM_QUANTUM_API_KEY=your_api_key_here
    exit /b 1
) else (
    echo ✅ Found IBM_QUANTUM_API_KEY in .env
)

echo.
echo [4/4] Checking required packages...
npm list @qiskit/algo-ibm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ @qiskit/algo-ibm is not installed
    echo Installing required packages...
    npm install @qiskit/algo-ibm --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install required packages
        exit /b 1
    )
) else (
    echo ✅ @qiskit/algo-ibm is installed
)

echo.
echo ✅ Setup check completed successfully!
echo.
echo Next steps:
echo 1. Make sure your IBM Quantum API key is correctly set in .env
echo 2. Run: node scripts/test-quantum-fetch.js
echo 3. If you get SSL errors, try: set NODE_TLS_REJECT_UNAUTHORIZED=0 && node scripts/test-quantum-fetch.js
