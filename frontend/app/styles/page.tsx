"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Palette, Type, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Frame {
  id: string
  name: string
  description: string
  preview: string
  style: string
}

const FRAMES: Frame[] = [
  {
    id: "none",
    name: "No Frame",
    description: "Clean and simple",
    preview: "⬜",
    style: "border-0",
  },
  {
    id: "polaroid",
    name: "Polaroid",
    description: "Classic instant photo",
    preview: "🖼️",
    style: "border-8 border-white shadow-lg",
  },
  {
    id: "polka",
    name: "Polka Dots",
    description: "Fun and playful",
    preview: "🔴",
    style: "border-4 border-pink-300 bg-gradient-to-r from-pink-100 to-rose-100",
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Bright and vibrant",
    preview: "✨",
    style: "border-2 border-pink-400 shadow-lg shadow-pink-300/50",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro aesthetic",
    preview: "📸",
    style: "border-4 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50",
  },
  {
    id: "minimal",
    name: "Minimalist",
    description: "Clean lines",
    preview: "▫️",
    style: "border border-gray-300",
  },
  {
    id: "heart",
    name: "Heart Border",
    description: "Love and romance",
    preview: "💕",
    style: "border-4 border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "Colorful and bright",
    preview: "🌈",
    style:
      "border-4 border-transparent bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 via-blue-200 to-purple-200",
  },
]

export default function StylesPage() {
  const searchParams = useSearchParams()
  const layoutId = searchParams.get("layout") || "4cut"
  const propsParam = searchParams.get("props") || ""
  const sessionId = searchParams.get("session") || ""

  const [selectedFrame, setSelectedFrame] = useState<string>("polaroid")
  const [customCaption, setCustomCaption] = useState<string>("")
  const [previewMode, setPreviewMode] = useState(false)

  const selectedFrameData = FRAMES.find((f) => f.id === selectedFrame)
  const canProceed = selectedFrame !== ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/capture?layout=${layoutId}&props=${propsParam}&session=${sessionId}`}
            className="flex items-center gap-2 text-pink-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Capture</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Frame & Style Selection</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <span className="text-lg font-medium text-gray-900">Frame & Style Selection</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-4/5"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Frame Selection */}
          <section>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Frame</h2>
              </div>
              <p className="text-gray-600">Select a frame style to enhance your photo strip.</p>
            </div>

            {/* Frame Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {FRAMES.map((frame) => (
                <Card
                  key={frame.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105 relative",
                    selectedFrame === frame.id ? "ring-2 ring-pink-500 bg-pink-50" : "hover:shadow-md",
                  )}
                  onClick={() => setSelectedFrame(frame.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-3">{frame.preview}</div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{frame.name}</h3>
                    <p className="text-xs text-gray-600">{frame.description}</p>
                    {selectedFrame === frame.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Caption */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-5 h-5 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">Add Custom Caption</h3>
              </div>
              <Input
                placeholder="Enter your caption (max 30 characters)"
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value.slice(0, 30))}
                className="text-center text-lg"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">{customCaption.length}/30 characters</p>
            </div>
          </section>

          {/* Preview Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview</h2>
              <p className="text-gray-600">See how your photo strip will look with the selected frame and caption.</p>
            </div>

            {/* Preview Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  {/* Mock photo strip preview */}
                  <div
                    className={cn(
                      "mx-auto bg-white rounded-lg overflow-hidden transition-all duration-300",
                      selectedFrameData?.style,
                      layoutId === "full"
                        ? "w-48 h-48"
                        : layoutId === "2cut"
                          ? "w-32 h-64"
                          : layoutId === "4cut"
                            ? "w-48 h-48"
                            : "w-32 h-64",
                    )}
                  >
                    {/* Mock photos */}
                    <div
                      className={cn(
                        "grid gap-1 p-2 h-full",
                        layoutId === "full"
                          ? "grid-cols-1"
                          : layoutId === "2cut"
                            ? "grid-cols-1 grid-rows-2"
                            : layoutId === "4cut"
                              ? "grid-cols-2 grid-rows-2"
                              : "grid-cols-2 grid-rows-4",
                      )}
                    >
                      {Array.from({
                        length: layoutId === "full" ? 1 : layoutId === "2cut" ? 2 : layoutId === "4cut" ? 4 : 8,
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-pink-200 to-rose-200 rounded flex items-center justify-center text-xs text-gray-600"
                        >
                          📷
                        </div>
                      ))}
                    </div>

                    {/* Caption */}
                    {customCaption && (
                      <div className="bg-white p-2 text-center border-t">
                        <p className="text-xs font-medium text-gray-800">{customCaption}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frame Info */}
                {selectedFrameData && (
                  <div className="mt-4 text-center">
                    <Badge variant="secondary" className="mb-2">
                      {selectedFrameData.name}
                    </Badge>
                    <p className="text-sm text-gray-600">{selectedFrameData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Style Options */}
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">✨ Style Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Polaroid frames work great for vintage vibes</li>
                  <li>• Neon glow adds energy to party photos</li>
                  <li>• Keep captions short and sweet</li>
                  <li>• Minimalist frames let your photos shine</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-12">
          <Link href={`/capture?layout=${layoutId}&props=${propsParam}`}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retake Photos
            </Button>
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Frame: {selectedFrameData?.name || "None"}
              {customCaption && ` • Caption: "${customCaption}"`}
            </p>
          </div>

          <Link
            href={
              canProceed
                ? `/export?layout=${layoutId}&props=${propsParam}&frame=${selectedFrame}&caption=${encodeURIComponent(customCaption)}&session=${sessionId}`
                : "#"
            }
          >
            <Button size="lg" disabled={!canProceed} className="bg-pink-500 hover:bg-pink-600">
              Continue to Download
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
