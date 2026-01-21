import { motion } from 'framer-motion';
import { profile } from '../profile';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

const icons = [Trophy, Medal, Crown, Star];

export default function Achievements() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                    Hall of Fame
                </h2>
                <p className="text-zinc-400">Recognition & Awards</p>
            </motion.div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.achievements.map((achievement, i) => {
                    const Icon = icons[i % icons.length];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all shadow-xl hover:shadow-yellow-500/10"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/0 rounded-full blur-2xl -mr-10 -mt-10 group-hover:from-yellow-500/30 transition-all" />

                            <div className="relative z-10 flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg text-black transform group-hover:rotate-12 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-yellow-400 transition-colors">
                                        {achievement}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                        Awarded
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
