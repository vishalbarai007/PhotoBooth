"use client"

import { Suspense } from 'react'
import { Sour_Gummy } from 'next/font/google'
import ARFaceFilter from '@/components/ar-face-filter'

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
})

export default function CameraPage() {
  return (
    <div className={`${sourGummy.className} min-h-screen bg-black`}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading AR Camera...</div>
        </div>
      }>
        <ARFaceFilter />
      </Suspense>
    </div>
  )
}
