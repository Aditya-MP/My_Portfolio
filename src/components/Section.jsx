import { motion } from 'framer-motion';

export default function Section({ children, id, className = "" }) {
    return (
        <section id={id} className={`min-h-screen w-full flex items-center justify-center p-4 relative ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-7xl mx-auto z-10"
            >
                {children}
            </motion.div>
        </section>
    );
}
