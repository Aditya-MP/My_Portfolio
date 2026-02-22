import { useFrame } from '@react-three/fiber';
import { useFBX, useTexture, useAnimations } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Phoenix({ position = [0, -2, 0], scale = 0.08, rotation = [0, 0, 0] }) {
    const group = useRef();

    // Load model and textures
    const fbx = useFBX('/models/phoenix/fly.fbx');

    // Load textures (Adjusting based on traditional naming conventions for this particular asset)
    const colorMapA = useTexture('/models/phoenix/Tex_Ride_FengHuang_01a_D_A.tga.png');
    const emissiveMapA = useTexture('/models/phoenix/Tex_Ride_FengHuang_01a_E.tga.png');
    const colorMapB = useTexture('/models/phoenix/Tex_Ride_FengHuang_01b_D_A.tga.png');
    const emissiveMapB = useTexture('/models/phoenix/Tex_Ride_FengHuang_01b_E.tga.png');

    // Load animations
    const { actions, names } = useAnimations(fbx.animations, group);

    useEffect(() => {
        colorMapA.colorSpace = THREE.SRGBColorSpace;
        colorMapB.colorSpace = THREE.SRGBColorSpace;

        // Apply textures to the materials inside the FBX
        fbx.traverse((child) => {
            if (child.isMesh) {
                // Create a new material to ensure we have full control over the glowing properties
                const newMat = new THREE.MeshStandardMaterial({
                    map: child.name.includes("01a") || child.material.name.includes("01a") ? colorMapA : colorMapB,
                    emissiveMap: child.name.includes("01a") || child.material.name.includes("01a") ? emissiveMapA : emissiveMapB,
                    emissive: new THREE.Color(0xffaa00), // Fire color base
                    emissiveIntensity: 2.5, // High intensity for bloom
                    transparent: true,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide,
                });

                child.material = newMat;
            }
        });

        // Play the flying animation if it exists
        if (names.length > 0) {
            actions[names[0]].reset().fadeIn(0.5).play();
        }
    }, [fbx, actions, names, colorMapA, emissiveMapA, colorMapB, emissiveMapB]);

    useFrame((state) => {
        if (group.current) {
            // Slow majestic floating
            group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
        }
    });

    return (
        <group ref={group} position={position} rotation={rotation} scale={scale}>
            <primitive object={fbx} />
        </group>
    );
}
