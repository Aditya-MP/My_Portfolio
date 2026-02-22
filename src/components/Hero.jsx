import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Phoenix from './Phoenix';
import { motion } from 'framer-motion';
import { useRef, useState, Suspense } from 'react';
function AnimatedSphere() {
    const sphereRef = useRef();

    useFrame(({ clock }) => {
        sphereRef.current.rotation.x = clock.getElapsedTime() * 0.2;
        sphereRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
                <MeshDistortMaterial
                    color="#7444ff"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    );
}

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

export default function Hero() {
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 15] }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 10, 5]} intensity={3} color="#ffffff" />
                    <pointLight position={[-5, -5, -5]} intensity={2} color="#ff0000" />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    {/* The new Phoenix Model with Suspense for async loading */}
                    <Suspense fallback={null}>
                        <Phoenix position={[0, -2, 0]} scale={0.03} />
                    </Suspense>

                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

                    {/* Post Processing for the "Ultra Level" fire glow */}
                    <EffectComposer>
                        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
                    </EffectComposer>
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
