/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/models/Astronaut.glb -o src/components/Astronaut.tsx -k -K -r public 
*/

import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
    nodes: {
        Pistol: THREE.Mesh;
        FinnTheFrog: THREE.SkinnedMesh;
        Root: THREE.Bone;
    };
    materials: {
        Atlas: THREE.MeshStandardMaterial;
        Atlas: THREE.MeshStandardMaterial;
    };
    animations: GLTFAction[];
};

type ActionName =
    | 'CharacterArmature|Death'
    | 'CharacterArmature|Duck'
    | 'CharacterArmature|HitReact'
    | 'CharacterArmature|Idle'
    | 'CharacterArmature|Idle_Gun'
    | 'CharacterArmature|Jump'
    | 'CharacterArmature|Jump_Idle'
    | 'CharacterArmature|Jump_Land'
    | 'CharacterArmature|No'
    | 'CharacterArmature|Punch'
    | 'CharacterArmature|Run'
    | 'CharacterArmature|Run_Gun'
    | 'CharacterArmature|Run_Gun_Shoot'
    | 'CharacterArmature|Walk'
    | 'CharacterArmature|Walk_Gun'
    | 'CharacterArmature|Wave'
    | 'CharacterArmature|Weapon'
    | 'CharacterArmature|Yes';
interface GLTFAction extends THREE.AnimationClip {
    name: ActionName;
}
type ContextType = Record<
    string,
    React.ForwardRefExoticComponent<
        | JSX.IntrinsicElements['mesh']
        | JSX.IntrinsicElements['skinnedMesh']
        | JSX.IntrinsicElements['bone']
    >
>;

export default function Astronaut(props: JSX.IntrinsicElements['group']) {
    const group = useRef<THREE.Group>();
    const { nodes, materials, animations } = useGLTF('/models/Astronaut.glb') as GLTFResult;
    const { actions } = useAnimations(animations, group);
    return (
        <group ref={group} {...props} dispose={null}>
            <group name='Root_Scene'>
                <group name='RootNode'>
                    <group name='CharacterArmature' rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <primitive object={nodes.Root} />
                    </group>
                    <skinnedMesh
                        name='FinnTheFrog'
                        geometry={nodes.FinnTheFrog.geometry}
                        material={materials.Atlas}
                        skeleton={nodes.FinnTheFrog.skeleton}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}
                    />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload('/models/Astronaut.glb');
