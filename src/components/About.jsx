import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profile } from '../profile';
import { Network, Code2, Cpu, Globe, GraduationCap, Briefcase, X } from 'lucide-react';

const categoryIcons = {
    programming: <Code2 size={16} />,
    aiml: <Cpu size={16} />,
    frameworks: <Network size={16} />,
    cloud: <Globe size={16} />,
};

export default function About() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start py-10 relative">
            {/* Left Column: Bio & Skills */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <div
                        onClick={() => profile.imgUrl && setIsProfileOpen(true)}
                        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] overflow-hidden ${profile.imgUrl ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''}`}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                            {profile.imgUrl ? (
                                <img src={profile.imgUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">👨‍💻</div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Adithya M P</h2>
                        <p className="text-purple-400">AIML Engineer</p>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 mb-10 backdrop-blur-sm">
                    <p className="text-zinc-300 leading-relaxed text-lg">
                        {profile.about}
                    </p>
                </div>

                <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        Tech Stack
                    </h3>
                    <div className="grid gap-6">
                        {Object.entries(profile.skills).map(([category, skills]) => (
                            <div key={category} className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl hover:bg-zinc-900/50 transition-colors">
                                <h4 className="flex items-center gap-2 text-sm uppercase tracking-wider text-zinc-400 mb-4 font-bold">
                                    {categoryIcons[category.toLowerCase()] || <Cpu size={16} />}
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30 transition-all cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Timeline (Experience & Education) */}
            <div className="space-y-10">

                {/* Experience Section */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Briefcase size={24} />
                        </div>
                        Experience
                    </h3>
                    <div className="space-y-6">
                        {profile.experience.map((exp, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{exp.role}</h4>
                                        <p className="text-zinc-400 font-medium">{exp.company}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-zinc-500">
                                        {exp.duration}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {exp.description.map((desc, j) => (
                                        <p key={j} className="text-zinc-400 text-sm leading-relaxed flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0" />
                                            {desc}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Education Section */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <GraduationCap size={24} />
                        </div>
                        Education
                    </h3>
                    <div className="space-y-6">
                        {profile.education.map((edu, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group flex items-center gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-purple-500/30 transition-all"
                            >
                                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-zinc-800 items-center justify-center text-3xl shadow-inner text-zinc-600 group-hover:text-purple-400 transition-colors">
                                    🏛️
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">{edu.degree}</h4>
                                    <p className="text-purple-400 text-sm font-medium mb-1">{edu.institution}</p>
                                    <div className="flex gap-4 text-xs text-zinc-500 font-medium uppercase tracking-wide">
                                        <span>{edu.duration}</span>
                                        <span>•</span>
                                        <span>{edu.details}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
            {/* Profile Image Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsProfileOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors z-10 hidden md:block"
                            >
                                <X size={24} />
                            </button>
                            <img
                                src={profile.imgUrl}
                                alt={profile.name}
                                className="w-full h-full object-contain max-h-[85vh]"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
