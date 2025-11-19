import React, { useEffect, useRef } from 'react';
import { ArrowRight, Zap, MessageSquare, Activity, Fingerprint, Boxes, FlaskConical, Github, FileText, Home } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle configuration
    const particleCount = Math.floor((width * height) / 15000); // Responsive count
    const particles: {x: number, y: number, vx: number, vy: number, size: number}[] = [];
    const connectionDistance = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#020617'); // Slate 950
      gradient.addColorStop(1, '#0f172a'); // Slate 900
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#60a5fa'; // Blue 400
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)'; // Blue 400 low opacity

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.lineWidth = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden z-50 flex flex-col scroll-smooth selection:bg-blue-500/30">
      
      {/* Background Canvas - stays fixed via CSS position */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none w-full h-full" />
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
                <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/20">
                    <FlaskConical className="text-blue-400" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-100">MolSim <span className="text-blue-500 font-mono font-normal">AI</span></span>
            </div>

            <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-6">
                    <button onClick={scrollToTop} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <Home size={16} />
                        Home
                    </button>
                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <FileText size={16} />
                        Docs
                    </button>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <Github size={16} />
                        GitHub
                    </a>
                </div>
                <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                <button 
                    onClick={onGetStarted}
                    className="px-5 py-2 bg-white text-slate-900 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-white/5"
                >
                    Launch App
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        
        <section className="w-full max-w-7xl mx-auto px-4 pt-20 pb-32 flex flex-col items-center text-center">
           
           {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase mb-8 animate-fade-in-up opacity-0" style={{animationDelay: '0.1s'}}>
                <Zap size={12} className="fill-current" />
                <span>Generative AI for Computational Chemistry</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 max-w-5xl leading-tight animate-fade-in-up opacity-0" style={{animationDelay: '0.3s'}}>
                Stop Coding Topologies. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                    Start Discovering.
                </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed animate-fade-in-up opacity-0" style={{animationDelay: '0.5s'}}>
                Replace complex <code>cpptraj</code> scripts and manual configurations with natural conversation. 
                Simulate, visualize, and analyze molecular dynamics instantly.
            </p>

            {/* CTA */}
            <div className="flex flex-col md:flex-row items-center gap-4 animate-fade-in-up opacity-0" style={{animationDelay: '0.7s'}}>
                 <button 
                    onClick={onGetStarted}
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] flex items-center gap-3"
                >
                    Start Simulation
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold text-lg border border-slate-800 transition-all flex items-center gap-2">
                    View Demo
                </button>
            </div>

            {/* Comparison Section */}
            <div className="mt-32 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center animate-fade-in-up opacity-0" style={{animationDelay: '0.9s'}}>
                {/* The Old Way */}
                <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                     <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-xl leading-none flex items-top justify-start space-x-6">
                        <div className="w-full p-6">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Legacy Scripting</span>
                             </div>
                             <div className="font-mono text-sm text-slate-500 space-y-1.5 text-left">
                                <p className="opacity-50"># trajectory_analysis.in</p>
                                <p><span className="text-purple-400">parm</span> 1AXC.prmtop</p>
                                <p><span className="text-purple-400">trajin</span> 1AXC_md.nc</p>
                                <p><span className="text-blue-400">rms</span> first :1-200@CA out rmsd.dat</p>
                                <p><span className="text-blue-400">atomicfluct</span> out fluct.dat ...</p>
                                <p className="text-red-400 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">Error: Topology file mismatch...</p>
                             </div>
                        </div>
                     </div>
                </div>

                 {/* The New Way */}
                 <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-400/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-xl flex flex-col">
                         <div className="p-6 h-full flex flex-col justify-between min-h-[220px]">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Zap size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">MolSim AI</span>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center mt-1 shadow-lg shadow-indigo-500/30">
                                        <Fingerprint size={16} className="text-white" />
                                    </div>
                                    <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none text-sm shadow-sm ring-1 ring-white/5 text-left">
                                        Load 1AXC and run a 5ns simulation. Plot the RMSD.
                                    </div>
                                </div>

                                <div className="flex gap-3 items-center justify-end">
                                     <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                        <Activity size={14} className="animate-pulse" />
                                        <span>Simulation running...</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Boxes size={16} className="text-white" />
                                    </div>
                                </div>
                             </div>
                         </div>
                    </div>
                 </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up opacity-0" style={{animationDelay: '1.1s'}}>
                {/* Feature 1 */}
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/50 transition-colors group">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                        <MessageSquare className="text-blue-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Natural Language</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Skip the complex syntax. Describe your simulation parameters in plain English and let the AI handle the topology generation.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/50 transition-colors group">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                        <Activity className="text-emerald-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Monitor trajectory stability, RMSD convergence, and potential energy fluctuations live as the simulation progresses.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/50 transition-colors group">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                        <Boxes className="text-purple-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Integrated 3D Viewer</h3>
                    <p className="text-slate-400 leading-relaxed">
                        A powerful WebGL-based molecular viewer (NGL) integrated directly into the workflow for instant visual verification.
                    </p>
                </div>
            </div>
        </section>

        <footer className="w-full border-t border-white/5 py-12 bg-slate-950/50 backdrop-blur-sm">
             <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 opacity-50">
                     <FlaskConical size={16} />
                     <span className="text-sm font-medium">MolSim AI Platform</span>
                </div>
                <div className="text-slate-500 text-sm">
                    © 2025 MolSim AI. Powered by Google Gemini.
                </div>
             </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;