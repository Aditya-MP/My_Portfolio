import { motion } from 'framer-motion';
import { Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Home');

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            {/* Floating Pill Container */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold tracking-tighter text-xl text-white hidden md:block"
                >
                    AM
                </motion.div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setActiveTab(item.name)}
                            className="relative px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            {activeTab === item.name && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{item.name}</span>
                        </a>
                    ))}
                </div>

                {/* Social Icons (Mini Pills) */}
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                    {[Github, Linkedin].map((Icon, i) => (
                        <motion.a
                            key={i}
                            href="#"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-white text-zinc-400 transition-colors"
                        >
                            <Icon size={16} />
                        </motion.a>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center justify-between w-full md:w-auto gap-4">
                    <span className="font-bold text-white">AM</span>
                    <button
                        className="p-2 rounded-full bg-white/10 text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Sheet Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-20 left-4 right-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl"
                >
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-lg font-medium text-zinc-300 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </a>
                    ))}
                </motion.div>
            )}
        </nav>
    );
}
