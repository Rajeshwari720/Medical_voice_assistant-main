"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export type doctorAgent = {
  id: number
  specialist: string
  description?: string
  image: string
  agentPrompt?: string
  voiceId?: string
  subscriptionRequired: boolean
}

type Props = {
  doctorAgent: doctorAgent
}

function DoctorAgentCard({ doctorAgent }: Props) {
  const [loading, setLoading] = useState(false);
  const router=useRouter();
  const { specialist, description, image,  subscriptionRequired } = doctorAgent
   const { has}=useAuth();
   //@ts-ignore
   const paidUser=has && has({plan: 'pro'});
   console.log(paidUser)


  return (
    <div className="relative">
      {/* Premium badge positioned in top-right over image */}
      {subscriptionRequired && (
        <span className="absolute top-2 right-2 bg-black
      -100 text-white text-xs font-semibold px-2 py-1 rounded-md z-10 shadow-md">
          Premium
        </span>
      )}

      {image ? (
        <Image
          src={image}
          alt={specialist || 'Doctor'}
          width={300}
          height={250}
          className="w-full h-[250px] object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-[250px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
          No Image Available
        </div>
      )}

      <h2 className="font-bold mt-2 text-lg">{specialist || 'Unknown Specialist'}</h2>

      <p className="line-clamp-2 text-sm text-gray-600 mt-1">
        {description || 'No description available.'}
      </p>

      <Button className='w-full mt-3' disabled={!paidUser &&doctorAgent.subscriptionRequired}>
        Start Consultation <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  )
}

export default DoctorAgentCard
