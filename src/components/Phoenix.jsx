import { useFrame, useLoader } from '@react-three/fiber';
import { useFBX, useAnimations } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Phoenix({ position = [0, -2, 0], scale = 0.03, rotation = [0, 0, 0] }) {
    const group = useRef();
    const applied = useRef(false);

    // Load textures FIRST (before FBX) so they're ready
    const [colorA, emissA, colorB, emissB] = useLoader(THREE.TextureLoader, [
        '/models/phoenix/Tex_Ride_FengHuang_01a_D_A.tga.png',
        '/models/phoenix/Tex_Ride_FengHuang_01a_E.tga.png',
        '/models/phoenix/Tex_Ride_FengHuang_01b_D_A.tga.png',
        '/models/phoenix/Tex_Ride_FengHuang_01b_E.tga.png',
    ]);

    // Load the FBX model (do NOT clone — cloning breaks skinned meshes)
    const fbx = useFBX('/models/phoenix/fly.fbx');

    // Setup animations
    const { actions, names } = useAnimations(fbx.animations, group);

    // Material setup — runs once
    useEffect(() => {
        if (applied.current) return;

        colorA.colorSpace = THREE.SRGBColorSpace;
        colorB.colorSpace = THREE.SRGBColorSpace;

        fbx.traverse((child) => {
            if (!child.isMesh) return;

            const name = (child.material?.name || child.name || '').toLowerCase();
            const useB = name.includes('01b');

            child.material = new THREE.MeshStandardMaterial({
                map: useB ? colorB : colorA,
                emissiveMap: useB ? emissB : emissA,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 1.2,
                transparent: true,
                alphaTest: 0.05,
                side: THREE.DoubleSide,
                roughness: 0.35,
                metalness: 0.25,
                envMapIntensity: 0.6,
            });
        });

        applied.current = true;
    }, [fbx, colorA, emissA, colorB, emissB]);

    // Animation — separate effect so it always plays
    useEffect(() => {
        if (names.length > 0 && actions[names[0]]) {
            const action = actions[names[0]];
            action.reset().fadeIn(0.5).play();
            action.setLoop(THREE.LoopRepeat, Infinity);
            return () => action.fadeOut(0.5);
        }
    }, [actions, names]);

    useFrame(({ clock }) => {
        if (group.current) {
            group.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8) * 0.4;
        }
    });

    return (
        <group ref={group} position={position} rotation={rotation} scale={scale}>
            <primitive object={fbx} />
        </group>
    );
}
