#!/bin/bash

echo "======================================================="
echo "   Running Project Verification Suite"
echo "======================================================="

# 1. Run Main Pipeline (CORAL + MLP)
echo "[1/3] Running Main Pipeline (CORAL + MLP)..."
cd notebooks
jupyter nbconvert --to notebook --execute Advanced_Implementation.ipynb --output executed_logs/Advanced_Implementation_Log.ipynb
if [ $? -eq 0 ]; then
    echo "✅ Main Pipeline Passed"
else
    echo "❌ Main Pipeline Failed"
    cd ..
    exit 1
fi

# 2. Run Optimization Experiments (Drift Scenarios)
echo "[2/3] Running Optimization Experiments (Drift Scenarios)..."
jupyter nbconvert --to notebook --execute Optimization_Experiments.ipynb --output executed_logs/Optimization_Experiments_Log.ipynb
if [ $? -eq 0 ]; then
    echo "✅ Optimization Experiments Passed"
else
    echo "❌ Optimization Experiments Failed"
    cd ..
    exit 1
fi

# 3. Run Concentration Experiments
echo "[3/3] Running Concentration Shift Experiments..."
jupyter nbconvert --to notebook --execute Concentration_Experiments.ipynb --output executed_logs/Concentration_Experiments_Log.ipynb
if [ $? -eq 0 ]; then
    echo "✅ Concentration Experiments Passed"
else
    echo "❌ Concentration Experiments Failed"
    cd ..
    exit 1
fi

cd ..

echo "======================================================="
echo "🎉 All Research Experiments Completed Successfully!"
echo "   Results saved to: docs/info.txt"
echo "======================================================="
