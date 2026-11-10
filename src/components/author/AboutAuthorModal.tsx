import React from 'react';
import { sound } from '../../data/soundEffects';
import { X, ShieldCheck, Feather, Sparkles, BookOpen, Mail, Award, CheckCircle2 } from 'lucide-react';

interface AboutAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutAuthorModal: React.FC<AboutAuthorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-void-800 bg-void-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                About the Author
              </h3>
              <p className="text-[11px] text-gold-400 font-semibold uppercase tracking-widest">
                SUKA SRI ORIGINALS Creator
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-void-900 border border-void-800 text-slate-400 hover:text-white hover:border-gold-500/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Author Hero Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gold-500/10 via-void-950 to-violet-950/20 border border-gold-500/30 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gold-500 via-amber-400 to-electric-400 p-0.5 shadow-[0_0_25px_rgba(255,215,0,0.3)] shrink-0">
              <div className="w-full h-full rounded-2xl bg-void-950 flex flex-col items-center justify-center text-gold-400">
                <span className="font-display text-3xl font-black">SV</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">AUTHOR</span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-[10px] font-bold text-gold-400 uppercase tracking-widest">
                <Award className="w-3 h-3" /> Certified Original Creator
              </div>
              <h4 className="font-display text-2xl font-black text-white">
                Srinivas Vennu
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visionary author, world architect, and founder of <strong>SUKA SRI ORIGINALS</strong>. Creator of the magnum opus manga saga <em>Mirai o Tsukuru Mono</em> (The Ones Who Build the Future).
              </p>
            </div>
          </div>

          {/* Scope of the Universe */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-void-950 border border-void-800">
              <div className="font-display text-xl font-bold text-gold-400">3 Parts</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Canonical Scope</div>
            </div>
            <div className="p-3.5 rounded-xl bg-void-950 border border-void-800">
              <div className="font-display text-xl font-bold text-electric-400">450 Chs</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Epic Length</div>
            </div>
            <div className="p-3.5 rounded-xl bg-void-950 border border-void-800">
              <div className="font-display text-xl font-bold text-violet-400">28 Arcs</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Story Bibles</div>
            </div>
          </div>

          {/* Creator Philosophy & Mission */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-bold uppercase tracking-wider text-gold-400">
              Artistic Philosophy & Publishing Independence
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              SUKA SRI ORIGINALS was created as an independent, sovereign publishing universe where stories can be told without compromise. Spanning cosmic fantasy, cyber-philosophy, and mythological high-stakes conflict, every arc is meticulously drafted to deliver world-class narrative power.
            </p>
            <blockquote className="p-4 rounded-xl bg-void-950 border-l-2 border-gold-500 text-xs italic text-slate-300 leading-relaxed">
              "The future is not predestined. It is forged by the choices we make and the stories we dare to bring to life."
            </blockquote>
          </div>

          {/* Intellectual Property & Security Declaration */}
          <div className="p-4 rounded-2xl bg-void-950 border border-void-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Intellectual Property & Copyright Statement</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All characters, dialogue, world lore, and chapter manuscripts are the exclusive intellectual property of Srinivas Vennu and SUKA SRI ORIGINALS. Protected by AES-256 encrypted master storage, Ed25519 digital signatures, and reader-specific dynamic watermarking.
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-void-950 border border-void-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-400" />
              <span>Official Author Desk:</span>
              <strong className="text-slate-200">sukasri.originals@gmail.com</strong>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Hyd, India</span>
          </div>
        </div>
      </div>
    </div>
  );
};
