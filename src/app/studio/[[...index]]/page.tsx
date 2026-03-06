'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/sanity.config'

export default function StudioPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-black">
      <NextStudio config={config} />
    </div>
  )
}
