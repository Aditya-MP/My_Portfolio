import { motion } from 'framer-motion';
import { Github, Star, Code2, ArrowUpRight } from 'lucide-react';
import { profile } from '../profile';

// A single Sticky Project Card
const ProjectCard = ({ project, index }) => {
    // We want each card to stick a little bit lower than the previous one
    // so you can see the top edge of the cards behind it.
    const topOffset = `calc(10vh + ${index * 25}px)`; 
    
    return (
        <div 
            className="sticky w-full"
            style={{ top: topOffset }}
        >
            {/* The Card */}
            <div className="w-full relative bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden group transform-gpu transition-all duration-700 hover:border-orange-500/50 hover:shadow-[0_0_80px_rgba(234,88,12,0.15)] flex flex-col md:flex-row h-auto md:h-[550px]">
                
                {/* Background Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                {/* Content Section (Left on Desktop, Bottom on Mobile) */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between relative z-10 order-2 md:order-1 bg-zinc-950/80 backdrop-blur-2xl md:border-r border-white/5">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-black tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                                <Star size={14} className="fill-orange-400" /> Featured
                            </span>
                            <span className="text-zinc-500 text-sm font-bold tracking-widest uppercase">{project.year}</span>
                        </div>

                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all duration-500">
                            {project.title}
                        </h3>

                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl font-medium">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {project.tech.map((tag) => (
                                <span key={tag} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold tracking-wide text-zinc-300 shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto mt-auto">
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none bg-white text-black hover:bg-orange-500 hover:text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-95 text-sm md:text-base tracking-wide"
                        >
                            Launch Project <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </a>
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 md:w-16 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl border border-white/10 transition-all duration-300 flex items-center justify-center active:scale-95 group/gh"
                            >
                                <Github size={22} className="group-hover/gh:scale-110 transition-transform" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Visual Section (Right on Desktop, Top on Mobile) */}
                <div className="w-full md:w-1/2 h-72 md:h-full relative overflow-hidden order-1 md:order-2 bg-zinc-900">
                    {project.cover ? (
                        <>
                            <img
                                src={project.cover}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]"
                            />
                            {/* Inner Shadow for depth */}
                            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
                            {/* Dark Overlay that fades out on hover */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000 pointer-events-none" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center group-hover:scale-105 transition-transform duration-1000">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="w-32 h-32 bg-zinc-900/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-2xl relative z-10">
                                <Code2 size={48} className="text-zinc-500 group-hover:text-orange-500 transition-colors duration-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Projects() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-32 md:py-48 min-h-screen relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[40vh] bg-orange-500/10 blur-[150px] -z-10 rounded-full pointer-events-none" />

            {/* Header */}
            <div className="text-center w-full mb-32 md:mb-48 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tighter leading-none">
                        SELECTED <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 [-webkit-text-stroke:1px_rgba(255,255,255,0.1)]">WORKS</span>
                    </h2>
                    <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium mt-8 leading-relaxed">
                        Pushing the boundaries of intelligent applications, scalable backends, and premium web experiences.
                    </p>
                </motion.div>
            </div>

            {/* Sticky Cards Container */}
            {/* The massive gap ensures that you have to scroll a bit before the next card covers the current one */}
            <div className="relative w-full flex flex-col gap-[30vh] md:gap-[50vh] pb-[20vh]">
                {profile.projects.map((proj, index) => (
                    <ProjectCard 
                        key={proj.id} 
                        project={proj} 
                        index={index} 
                    />
                ))}
            </div>
        </div>
    );
}
