import React from 'react';
import { X, BarChart2, TrendingUp, Zap, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface InsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InsightsModal({ isOpen, onClose }: InsightsModalProps) {
    if (!isOpen) return null;

    const driftData = [
        { scenario: 'Severe', RobustMLP: 79.9, Stacking: 65.4 },
        { scenario: 'Moderate', RobustMLP: 76.6, Stacking: 82.4 },
        { scenario: 'Immediate', RobustMLP: 55.6, Stacking: 53.9 },
    ];

    const concentrationData = [
        { method: 'Baseline', accuracy: 95.2 },
        { method: 'CORAL + MLP', accuracy: 50.7 },
        { method: 'Residualization', accuracy: 83.5 },
    ];

    const architectureData = [
        { model: 'Transformer', accuracy: 64.3 },
        { model: 'Robust MLP', accuracy: 78.3 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Zap className="text-yellow-400 w-6 h-6" />
                            Research Insights & Performance Metrics
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Key findings from Advanced Robust Gas Classification experiments</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-12">

                    {/* Section 1: Temporal Drift */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="text-blue-400 w-6 h-6" />
                            <h3 className="text-xl font-semibold text-white">Temporal Drift Mitigation</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-medium text-slate-400 mb-4">Model Performance by Drift Severity</h4>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={driftData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="scenario" tick={{ fill: '#94a3b8' }} />
                                            <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                            />
                                            <Legend />
                                            <Bar dataKey="RobustMLP" name="Robust MLP (CORAL)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Stacking" name="Stacking (RF+SVM)" fill="#64748b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="space-y-4 text-slate-300">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                    <h5 className="font-semibold text-blue-400 mb-2">Key Finding: Deep Learning Wins in Severe Drift</h5>
                                    <p className="text-sm leading-relaxed">
                                        Under <strong>Severe Drift</strong> (Train Batches 1-5, Test 10), the Robust MLP with CORAL alignment achieves <strong>79.9% accuracy</strong>, significantly outperforming the Stacking Classifier (65.4%). This confirms that aligning second-order statistics (CORAL) is crucial for long-term stability.
                                    </p>
                                </div>
                                <p className="text-sm text-slate-400">
                                    <strong>CORAL (Correlation Alignment)</strong> works by aligning the covariance matrices of the source and target domains, effectively "rotating" the feature space to match the drifted distribution without needing labels from the target domain.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Concentration Shift */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="text-emerald-400 w-6 h-6" />
                            <h3 className="text-xl font-semibold text-white">Concentration Shift Analysis</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4 text-slate-300 order-2 lg:order-1">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                                    <h5 className="font-semibold text-emerald-400 mb-2">Key Finding: Residualization is Key</h5>
                                    <p className="text-sm leading-relaxed">
                                        When testing on gas concentrations unseen during training (High Dose), standard domain adaptation (CORAL) fails (50.7%) because it destroys the magnitude information. <strong>Residualization</strong>, which removes the linear dependency on concentration, restores accuracy to <strong>83.5%</strong>.
                                    </p>
                                </div>
                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                    <li><strong>Baseline:</strong> 95.2% (High due to robust scaling)</li>
                                    <li><strong>CORAL:</strong> 50.7% (Fails for concentration shift)</li>
                                    <li><strong>Residualization:</strong> 83.5% (Robust to dose changes)</li>
                                </ul>
                            </div>
                            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 order-1 lg:order-2">
                                <h4 className="text-sm font-medium text-slate-400 mb-4">Method Efficacy for Concentration Shift</h4>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={concentrationData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                                            <YAxis dataKey="method" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                            />
                                            <Bar dataKey="accuracy" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Architecture */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart2 className="text-purple-400 w-6 h-6" />
                            <h3 className="text-xl font-semibold text-white">Architecture Benchmark</h3>
                        </div>
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h4 className="text-lg font-medium text-white mb-2">MLP vs. Transformer</h4>
                                <p className="text-slate-400 text-sm mb-4">
                                    Despite the popularity of Transformers, our experiments showed that for this specific sensor dataset (~13k samples), a well-tuned <strong>Robust MLP</strong> significantly outperforms a Sensor-Tokenized Transformer.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Transformer</div>
                                        <div className="text-2xl font-bold text-slate-300">64.3%</div>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-lg text-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                        <div className="text-xs text-blue-400 uppercase tracking-wider">Robust MLP</div>
                                        <div className="text-3xl font-bold text-blue-400">78.3%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
