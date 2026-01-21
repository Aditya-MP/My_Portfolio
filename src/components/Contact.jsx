import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, ArrowRight, MessageCircle } from 'lucide-react';
import { profile } from '../profile';

export default function Contact() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 text-center py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 font-bold text-sm mb-6 border border-purple-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Open to Opportunities
                </div>

                <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
                    Let's work <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">together.</span>
                </h2>

                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Have a project in mind? Let's turn your idea into reality.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <a
                        href={`mailto:${profile.email}`}
                        className="group flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-zinc-700 transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Email Me</h3>
                                <p className="text-zinc-500 text-sm group-hover:text-zinc-400">{profile.email}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <ArrowRight size={18} />
                        </div>
                    </a>

                    <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-blue-900/20 hover:border-blue-500/30 transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Linkedin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">LinkedIn</h3>
                                <p className="text-zinc-500 text-sm group-hover:text-zinc-400">Let's Connect</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white transition-all">
                            <ArrowRight size={18} />
                        </div>
                    </a>
                </div>

                <div className="mt-4">
                    <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
                    >
                        <Github size={16} /> Check out my code on GitHub
                    </a>
                </div>

            </motion.div>
        </div>
    );
}
