
import React from 'react';
import { Star, ArrowLeft, LayoutGrid, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

interface ReviewsPageProps {
    onBack: () => void;
}

const ReviewsPage: React.FC<ReviewsPageProps> = ({ onBack }) => {
    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
                        <div className="bg-white p-0.5 rounded-lg text-white shadow-sm overflow-hidden border border-slate-100 flex items-center justify-center">
                            <img src="/favicon.png" alt="SudokuHub Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-800 uppercase">SUDOKUHUB.LIVE</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                </div>
            </nav>

            {/* Header */}
            <div className="pt-32 pb-16 px-4 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
                        Customer <span className="text-indigo-600">Stories</span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        See what our community of puzzle masters has to say about their journey with Sudoku Pro.
                    </p>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <Quote size={24} className="text-indigo-200 mb-4" />
                            <p className="text-slate-600 font-medium mb-6 leading-relaxed italic">"{t.text}"</p>

                            <div className="mt-auto border-t border-slate-50 pt-6">
                                <div className="flex gap-1 mb-2">
                                    {Array.from({ length: t.rating }).map((_, i) => (
                                        <Star key={i} size={14} className="text-amber-400 fill-current" />
                                    ))}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{t.name}</h4>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-4xl mx-auto px-4 text-center mt-8">
                <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Ready to join them?</h3>
                <button onClick={onBack} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
                    PLAY NOW
                </button>
            </div>
        </div>
    );
};

export default ReviewsPage;
