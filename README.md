# Robust Gas Classification under Distribution Shift

**Advanced Machine Learning for Gas Sensor Drift Compensation & Analysis**

![Project Status](https://img.shields.io/badge/Status-Publication%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red)

## 📌 Overview
This project implements advanced domain adaptation techniques to address **Temporal Drift** and **Concentration Shift** in gas sensor arrays. It leverages deep learning (Robust MLP), Transformer architectures, and statistical alignment (CORAL) to maintain classification accuracy over extended periods.

We propose and implement a dual-strategy framework:
1.  **CORAL (Correlation Alignment)**: To mitigate **Temporal Drift** (sensor aging).
2.  **Residualization**: To mitigate **Concentration Shift** (dose dependency).

Our approach achieves **~80% accuracy** on severe temporal drift (vs. ~47% baseline) and **~83% accuracy** on concentration shift (vs. ~50% for unadapted models).

## 📂 Repository Structure

The codebase is organized into modular components for reproducibility and scalability.

```
.
├── notebooks/                  # Jupyter Notebooks for Experiments
│   ├── Advanced_Implementation.ipynb      # Main pipeline: CORAL + Robust MLP
│   ├── Optimization_Experiments.ipynb     # Optuna Tuning & Drift Scenarios
│   ├── Concentration_Experiments.ipynb    # Concentration Shift Analysis
│   ├── executed_logs/                         # Logs of executed runs
│   └── archive/                               # Archived exploratory notebooks
├── src/                        # Source Code Package
│   ├── models/                 # Deep Learning & Stacking Models
│   ├── domain_adaptation.py    # CORAL Algorithm Implementation
│   ├── features.py             # Advanced Feature Engineering (Proxies, Residuals)
│   ├── optimization.py         # Optuna & Joblib Utilities
│   ├── data_loader.py          # Robust Data Loading
│   └── visualization.py        # t-SNE & Plotting Utilities
├── docs/                       # Documentation & Reports
│   ├── Advanced_Implementation_Report.md  # FINAL RESEARCH REPORT
│   └── group_54_report (1).pdf            # Original Baseline Report
├── config/                     # Configuration Files
└── data/                       # Dataset (UCI Gas Sensor Array)
```

## 🚀 Getting Started

### Prerequisites
Ensure you have Python 3.11+ installed. Install dependencies:

```bash
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu  # Or cuda if available
pip install optuna joblib
```

### Running the Experiments

1.  **Main Implementation (CORAL + MLP)**:
    Run `notebooks/Advanced_Implementation.ipynb` to see the core methodology and t-SNE visualizations.

2.  **Optimization & Drift Scenarios**:
    Run `notebooks/Optimization_Experiments.ipynb` to perform hyperparameter tuning and evaluate on Severe/Moderate/Immediate drift.

3.  **Concentration Shift**:
    Run `notebooks/Concentration_Experiments.ipynb` to verify the Residualization strategy.

4.  **Web App Simulation**:
    Explore the interactive dashboard to visualize drift and concentration effects.
    ```bash
    cd web_app
    npm run dev
    # Open http://localhost:3000
    ```

## 📊 Key Results

| Scenario | Challenge | Best Method | Accuracy | Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Temporal Drift** | Sensor Aging (Months) | **CORAL + Robust MLP** | **79.9%** | +33% over Baseline |
| **Concentration Shift** | Dose Variation | **Residualization + MLP** | **83.5%** | +33% over CORAL |

## 📄 Documentation
For a detailed analysis of the methodology, mathematical background, and full results, please refer to the **[Advanced Implementation Report](docs/Advanced_Implementation_Report.md)**.

## 👥 Authors
- **Manish Ghoshal**

---
*This project was elevated to publication-level quality using advanced Domain Adaptation and Deep Learning techniques.*
