import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import Phoenix from './Phoenix';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useRef, useState } from 'react';

const splitText = (text) => {
    return text.split("").map((char, index) => (
        <motion.span
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, type: 'spring' }}
            className="inline-block"
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    ));
};

// Loading spinner shown while Phoenix model downloads
function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-zinc-500 text-sm font-medium">Loading 3D Model...</span>
            </div>
        </div>
    );
}

export default function Hero() {
    const heroRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Pause Canvas rendering when hero is scrolled off-screen
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (heroRef.current) observer.observe(heroRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                {!modelLoaded && <LoadingSpinner />}
                <Canvas
                    camera={{ position: [0, 2, 25], fov: 50 }}
                    dpr={[1, 1.5]}
                    performance={{ min: 0.5 }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    frameloop={isVisible ? 'always' : 'never'}
                >
                    <AdaptiveDpr pixelated />
                    <AdaptiveEvents />

                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
                    <pointLight position={[-5, -5, -5]} intensity={1.5} color="#ff3300" />

                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                    <Suspense fallback={null}>
                        <Phoenix
                            position={[0, -1, 0]}
                            scale={0.02}
                            onLoaded={() => setModelLoaded(true)}
                        />
                    </Suspense>

                    <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} minDistance={10} maxDistance={50} />
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="z-10 text-center px-4 pointer-events-none select-none relative w-full">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10"
                >
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-2 mix-blend-difference">
                        {splitText("CREATIVE")}
                    </h1>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] md:[-webkit-text-stroke:3px_rgba(255,255,255,0.1)] fall-back-text" style={{ textShadow: "0 0 40px rgba(255,100,0,0.4)" }}
                    >
                        {splitText("DEVELOPER")}
                    </h1>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="h-1 bg-white/20 mx-auto mt-8 rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}
