import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight, Github, Star, Clock, Heart } from 'lucide-react';
import { profile } from '../profile';

export default function Projects() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => {
            let nextIndex = prevIndex + newDirection;
            if (nextIndex < 0) nextIndex = profile.projects.length - 1;
            if (nextIndex >= profile.projects.length) nextIndex = 0;
            return nextIndex;
        });
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const project = profile.projects[currentIndex];

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
        }),
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
            <div className="text-left w-full max-w-sm md:max-w-4xl mb-8">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
                    Recommended <span className="text-orange-500">for you</span>
                </h2>
                <p className="text-zinc-400">Curated projects based on your preferences</p>
            </div>

            <div className="relative w-full max-w-md md:max-w-4xl h-[520px] md:h-[450px] flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) paginate(1);
                            else if (swipe > swipeConfidenceThreshold) paginate(-1);
                        }}
                        className="absolute w-full h-full z-20 cursor-grab active:cursor-grabbing"
                    >
                        {/* Card Container - Mobile: Portrait, Desktop: Landscape */}
                        <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row hover:shadow-orange-500/10 transition-shadow duration-300">

                            {/* Visual Section (Image Imitation) */}
                            <div className="h-2/5 md:h-full md:w-5/12 relative overflow-hidden bg-zinc-800 group flex-shrink-0">
                                {project.cover ? (
                                    <>
                                        <img
                                            src={project.cover}
                                            alt={project.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
                                    </>
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${currentIndex % 2 === 0 ? 'from-orange-500 to-red-600' : 'from-purple-600 to-blue-600'
                                        } opacity-80 group-hover:scale-110 transition-transform duration-700`} />
                                )}

                                {/* Centered Placeholder (Only if no image) */}
                                {!project.cover && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-4xl shadow-lg">
                                            {currentIndex % 2 === 0 ? '🔥' : '🚀'}
                                        </div>
                                    </div>
                                )}

                                {/* Badge - Top Left */}
                                <div className="absolute top-4 left-4 bg-white/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wide">
                                    <Star size={12} className="fill-orange-500 text-orange-500" /> Top Pick
                                </div>

                                {/* Year Badge - Top Right */}
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    {project.year}
                                </div>

                                {/* Tech Badge - Bottom Right */}
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                                    <Clock size={12} /> {project.tech.length} Technologies
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="h-3/5 md:h-full md:w-7/12 p-4 md:p-8 flex flex-col justify-between bg-zinc-900 relative overflow-y-auto">
                                <button className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Heart size={20} />
                                </button>

                                <div>
                                    <h3 className="text-xl md:text-3xl font-bold text-white mb-1 leading-tight pr-10">
                                        {project.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-yellow-400 text-sm font-black flex items-center gap-1">
                                            <Star size={14} className="fill-yellow-400" /> 4.9
                                        </span>
                                        <span className="text-zinc-600 text-xs">•</span>
                                        <span className="text-zinc-400 text-sm font-medium">Software Engineering</span>
                                    </div>

                                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none mb-6">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tech.slice(0, 4).map((tag) => (
                                            <span key={tag} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/50 rounded-md text-xs font-semibold text-zinc-300">
                                                {tag}
                                            </span>
                                        ))}
                                        {project.tech.length > 4 && (
                                            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/50 rounded-md text-xs font-semibold text-zinc-300">
                                                +{project.tech.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        View Live <ExternalLink size={18} />
                                    </a>
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 px-4 rounded-xl border border-zinc-700 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                                        >
                                            <Github size={18} /> Code
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons (Floating) */}
                <button
                    onClick={() => paginate(-1)}
                    className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 p-3 bg-zinc-800 text-white rounded-full shadow-lg border border-zinc-700 hover:scale-110 active:scale-90 transition-transform z-30"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => paginate(1)}
                    className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 p-3 bg-zinc-800 text-white rounded-full shadow-lg border border-zinc-700 hover:scale-110 active:scale-90 transition-transform z-30"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center mt-8 gap-2">
                {profile.projects.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            const direction = i > currentIndex ? 1 : -1;
                            paginate(direction);
                        }}
                        className={`transition-all duration-300 rounded-full ${i === currentIndex ? "bg-orange-600 w-8 h-2" : "bg-zinc-800 w-2 h-2 hover:bg-zinc-700"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
