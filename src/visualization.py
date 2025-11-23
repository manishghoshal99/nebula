import matplotlib.pyplot as plt
import seaborn as sns

def set_plot_style(context="notebook", style="whitegrid", dpi=120):
    """Sets the plotting style."""
    sns.set_context(context)
    sns.set_style(style)
    plt.rcParams["figure.dpi"] = dpi

def plot_class_counts(df, figsize=(7, 4)):
    """Plots the class counts."""
    plt.figure(figsize=figsize)
    ax = sns.countplot(y="ClassName", data=df, order=df['ClassName'].value_counts().index)
    ax.set_title("Class counts")
    ax.set_xlabel("Count")
    ax.set_ylabel("Gas")
    for p in ax.patches:
        ax.text(p.get_width()+5, p.get_y()+p.get_height()/2, int(p.get_width()), va='center')
    plt.tight_layout()
    return ax
