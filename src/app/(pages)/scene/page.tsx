import ParticleRing from '@/components/common/ParticleRing'
import SolarSystem from '@/components/SolarSystem/SolarSystem'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
     title: 'The Solar System - OrbitView',
 };

const ScenePage = () => {
     return (
          <div className='relative'>
               <div className='fixed left-0 right-0 top-0'>
                    <SolarSystem />
               </div>
          </div>
     )
}

export default ScenePage
