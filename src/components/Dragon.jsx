import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Trail, Sparkles, Float, ScreenQuad } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

// Procedural Wing Component
function DragonWing({ side = 1 }) {
    const mesh = useRef();

    useFrame(({ clock }) => {
        if (mesh.current) {
            // Flapping animation
            const t = clock.getElapsedTime() * 4;
            mesh.current.rotation.z = Math.sin(t) * 0.4 * side + (side === 1 ? -0.2 : 0.2);
            mesh.current.rotation.x = Math.sin(t * 0.5) * 0.1;
        }
    });

    return (
        <group ref={mesh} rotation={[0, 0, side === 1 ? -0.5 : 0.5]}>
            <mesh position={[side * 2.5, 0, 0]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={3}
                        array={new Float32Array([
                            0, 0, 0,                    // Root
                            side * 5, 2, -1,            // Tip
                            side * 3, -3, 0.5             // Back
                        ])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <meshStandardMaterial
                    color="#0a0a0a"
                    roughness={0.6}
                    metalness={0.3}
                    side={THREE.DoubleSide}
                    flatShading={true}
                />
            </mesh>
        </group>
    );
}

function DragonHead({ position, rotation }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Skull */}
            <mesh scale={[1, 0.8, 1.5]}>
                <boxGeometry args={[0.8, 0.9, 1.2]} />
                <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Snout */}
            <mesh position={[0, -0.2, 1]} rotation={[0.2, 0, 0]}>
                <coneGeometry args={[0.4, 1.5, 4]} />
                <meshStandardMaterial color="#080808" roughness={0.5} metalness={0.5} />
            </mesh>

            {/* Glowing Eyes (Red/Orange for Drogon feel) */}
            <mesh position={[0.25, 0.1, 0.4]} rotation={[0.2, 0.2, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ff3300" toneMapped={false} />
                <pointLight distance={5} intensity={8} color="#ff3300" />
            </mesh>
            <mesh position={[-0.25, 0.1, 0.4]} rotation={[0.2, -0.2, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ff3300" toneMapped={false} />
                <pointLight distance={5} intensity={8} color="#ff3300" />
            </mesh>

            {/* Spikes/Horns */}
            <group position={[0, 0.5, -0.2]}>
                {[...Array(6)].map((_, i) => (
                    <mesh key={i} position={[
                        (i % 2 === 0 ? 1 : -1) * (0.2 + i * 0.05),
                        i * 0.1,
                        -i * 0.2
                    ]} rotation={[-0.5, 0, 0]}>
                        <coneGeometry args={[0.05, 0.6 + i * 0.1, 4]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                ))}
            </group>

            {/* Jaw */}
            <mesh position={[0, -0.5, 0.6]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[0.5, 0.2, 1.2]} />
                <meshStandardMaterial color="#0b0b0b" />
            </mesh>
        </group>
    );
}

export default function Dragon() {
    const { viewport } = useThree();
    const headRef = useRef();
    const bodyRef = useRef([]);

    // Create spine segments
    const segmentCount = 25; // Longer tail
    const segments = useMemo(() => new Array(segmentCount).fill(0).map((_, i) => ({
        size: 1 - (i / segmentCount),
        spineOffset: Math.random() * 0.2
    })), []);

    useFrame((state, delta) => {
        // Mouse follow logic
        const x = (state.mouse.x * viewport.width) / 2;
        const y = (state.mouse.y * viewport.height) / 2;

        if (headRef.current) {
            // Head smoothly follows mouse, but with a bit of "weight"
            headRef.current.position.lerp(new THREE.Vector3(x, y, 0), 0.08);
            headRef.current.lookAt(new THREE.Vector3(x, y, 50));
            // Sway head slightly
            headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1) * 0.1;
        }

        // Body follow logic (IK snake)
        let targetPos = headRef.current.position.clone();

        segments.forEach((_, i) => {
            const currentMesh = bodyRef.current[i];
            if (currentMesh) {
                // Distance constraint would be better, but lerp is okay for stylistic movement
                const lerpSpeed = 0.35 - (i * 0.01); // Tail lags more
                currentMesh.position.lerp(targetPos, lerpSpeed > 0.05 ? lerpSpeed : 0.05);

                currentMesh.lookAt(targetPos);
                targetPos = currentMesh.position.clone();
            }
        });
    });

    return (
        <>
            {/* Lights specifically for the dragon to make it look menacing */}
            <pointLight position={[10, 10, 10]} intensity={2} color="#444" />
            <pointLight position={[-10, -10, -5]} intensity={5} color="#d43f00" distance={20} />

            {/* Head Group */}
            <group ref={headRef}>
                <DragonHead position={[0, 0, 0]} />

                {/* Wings attached to head/upper body */}
                <group position={[0, -0.5, -1]}>
                    <DragonWing side={1} />
                    <DragonWing side={-1} />
                </group>

                {/* Fire Breath - Intense and directed */}
                <Sparkles
                    count={80}
                    scale={[2, 2, 8]}
                    size={12}
                    speed={2}
                    opacity={0.8}
                    color="#ff5500"
                    position={[0, -0.5, 4]} // In front of mouth
                    noise={0.5}
                />
            </group>

            {/* Body Segments */}
            {segments.map((s, i) => (
                <group key={i} ref={el => bodyRef.current[i] = el}>
                    {/* Main Body Segment */}
                    <mesh scale={[s.size * 0.8, s.size * 0.8, s.size]}>
                        {/* Custom shape for 'scales' look using displacement basically via geometry choice */}
                        <cylinderGeometry args={[0.5, 0.4, 0.6, 6]} />
                        <meshStandardMaterial
                            color="#080808"
                            roughness={0.4}
                            metalness={0.7}
                            flatShading
                        />
                    </mesh>

                    {/* Spines on back */}
                    <mesh position={[0, s.size * 0.5, 0]} rotation={[-0.5, 0, 0]}>
                        <coneGeometry args={[0.1 * s.size, 0.6 * s.size, 4]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                </group>
            ))}

            {/* Ambient Fire/Ash in the environment */}
            <Sparkles count={200} scale={[20, 20, 20]} size={2} speed={0.5} opacity={0.4} color="#ff3300" noise={1} />
        </>
    );
}
