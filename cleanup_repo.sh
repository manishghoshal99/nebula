#!/bin/bash

# 1. Create Archive for Notebooks
mkdir -p notebooks/archive
mkdir -p notebooks/executed_logs

# 2. Move Experimental/Old Notebooks to Archive
mv notebooks/Exp1_Drift_Visualization.ipynb notebooks/archive/ 2>/dev/null
mv notebooks/Exp2_Sensor_Ablation.ipynb notebooks/archive/ 2>/dev/null
mv notebooks/Exp3_Deep_Learning.ipynb notebooks/archive/ 2>/dev/null
mv "notebooks/FinalProject(1).ipynb" notebooks/archive/Baseline_Original.ipynb 2>/dev/null

# 3. Move Executed Logs (keep main notebooks clean)
mv notebooks/*_Executed.ipynb notebooks/executed_logs/ 2>/dev/null
mv notebooks/*_Executed_Final.ipynb notebooks/executed_logs/ 2>/dev/null

# 4. Clean up root
rm -rf .DS_Store
rm -rf notebooks/.DS_Store

echo "Repository cleanup complete. Notebooks organized."
