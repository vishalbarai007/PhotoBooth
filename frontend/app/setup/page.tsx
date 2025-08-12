"use client"
import { Sour_Gummy } from 'next/font/google'
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Prop {
  id: string
  name: string
  emoji: string
  category: string
}

interface Layout {
  id: string
  name: string
  description: string
  count: number
  grid: string
  preview: string
}

const PROPS: Prop[] = [
  { id: "hat1", name: "Party Hat", emoji: "🎉", category: "hats" },
  { id: "glasses1", name: "Sunglasses", emoji: "🕶️", category: "glasses" },
  { id: "mustache1", name: "Mustache", emoji: "👨", category: "facial" },
  { id: "crown1", name: "Crown", emoji: "👑", category: "hats" },
  { id: "glasses2", name: "Nerd Glasses", emoji: "🤓", category: "glasses" },
  { id: "bow1", name: "Bow Tie", emoji: "🎀", category: "accessories" },
  { id: "emoji1", name: "Heart Eyes", emoji: "😍", category: "emoji" },
  { id: "emoji2", name: "Laughing", emoji: "😂", category: "emoji" },
  { id: "hat2", name: "Top Hat", emoji: "🎩", category: "hats" },
  { id: "mask1", name: "Face Mask", emoji: "😷", category: "facial" },
  { id: "emoji3", name: "Winking", emoji: "😉", category: "emoji" },
  { id: "emoji4", name: "Cool", emoji: "😎", category: "emoji" },
]

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
})


const LAYOUTS: Layout[] = [
  {
    id: "full",
    name: "Full Photo",
    description: "Single large photo",
    count: 1,
    grid: "1x1",
    preview: "📷",
  },
  {
    id: "2cut",
    name: "2-Cut Strip",
    description: "Classic photo strip",
    count: 2,
    grid: "1x2",
    preview: "📸📸",
  },
  {
    id: "4cut",
    name: "4-Cut Grid",
    description: "2x2 photo grid",
    count: 4,
    grid: "2x2",
    preview: "📷📷\n📷📷",
  },
  {
    id: "8cut",
    name: "8-Cut Grid",
    description: "2x4 photo grid",
    count: 8,
    grid: "2x4",
    preview: "📷📷\n📷📷\n📷📷\n📷📷",
  },
]

export default function SetupPage() {
  const [selectedProps, setSelectedProps] = useState<string[]>([])
  const [selectedLayout, setSelectedLayout] = useState<string>("")
  const [dragOver, setDragOver] = useState(false)

  const toggleProp = (propId: string) => {
    setSelectedProps((prev) => (prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.includes("image") && file.size <= 2 * 1024 * 1024) {
      // Handle custom prop upload
      console.log("Uploading custom prop:", file.name)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type.includes("image") && file.size <= 2 * 1024 * 1024) {
      console.log("Dropped custom prop:", file.name)
    }
  }

  const selectedLayoutData = LAYOUTS.find((l) => l.id === selectedLayout)
  const canProceed = selectedLayout !== ""

  return (
    <div className={`${sourGummy.className} min-h-screen bg-[#ffc5a6]`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-pink-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Setup Your PhotoBooth</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="text-lg font-medium text-gray-900">Props & Layout Setup</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-1/4"></div>
          </div>
        </div>

        {/* Props Selection */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Props</h2>
            <p className="text-gray-600">
              Select props to overlay on your photos. You can choose multiple props or skip this step.
            </p>
          </div>

          {/* Props Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-6">
            {PROPS.map((prop) => (
              <Card
                key={prop.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 relative",
                  selectedProps.includes(prop.id) ? "ring-2 ring-pink-500 bg-pink-50" : "hover:shadow-md",
                )}
                onClick={() => toggleProp(prop.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-4xl mb-2">{prop.emoji}</div>
                  <p className="text-xs font-medium text-gray-700 truncate">{prop.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {prop.category}
                  </Badge>
                  {selectedProps.includes(prop.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Prop Upload */}
          {/* <Card
            className={cn(
              "border-2 border-dashed transition-colors",
              dragOver ? "border-pink-500 bg-pink-50" : "border-gray-300",
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Upload Custom Prop</h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag & drop a PNG image or click to browse (max 2MB, transparent background recommended)
              </p>
              <input
                type="file"
                accept="image/png,image/gif"
                onChange={handleFileUpload}
                className="hidden"
                id="prop-upload"
              />
              <label htmlFor="prop-upload">
                <Button variant="outline" className="cursor-pointer bg-transparent">
                  Choose File
                </Button>
              </label>
            </CardContent>
          </Card> */}
        </section>

        {/* Layout Selection */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Layout</h2>
            <p className="text-gray-600">Select how many photos you want to take and how they'll be arranged.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAYOUTS.map((layout) => (
              <Card
                key={layout.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 relative",
                  selectedLayout === layout.id ? "ring-2 ring-pink-500 bg-pink-50" : "hover:shadow-md",
                )}
                onClick={() => setSelectedLayout(layout.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="text-4xl font-mono whitespace-pre-line leading-tight">{layout.preview}</div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{layout.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{layout.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {layout.count} photo{layout.count > 1 ? "s" : ""} • {layout.grid}
                  </Badge>
                  {selectedLayout === layout.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Selected: {selectedProps.length} props,{" "}
              {selectedLayoutData ? `${selectedLayoutData.name} (${selectedLayoutData.count} photos)` : "no layout"}
            </p>
          </div>

          <Link href={canProceed ? `/camera?layout=${selectedLayout}&props=${selectedProps.join(",")}` : "#"}>
            <Button size="lg" disabled={!canProceed} className="bg-pink-500 hover:bg-pink-600">
              Next: Camera
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
