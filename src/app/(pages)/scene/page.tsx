import ParticleRing from '@/components/common/ParticleRing'
import { Button } from '@/components/ui/button'
import React from 'react'

const ScenePage = () => {
     return (
          <div className='relative'>
               <div className='fixed left-0 right-0 top-0'>
                    <ParticleRing />
               </div>
          </div>
     )
}

export default ScenePage
