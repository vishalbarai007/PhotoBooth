"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Camera, RotateCcw, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CapturedShot {
  id: string
  imageData: string
  timestamp: number
  retakeCount: number
}

const LAYOUTS = {
  full: { name: "Full Photo", count: 1 },
  "2cut": { name: "2-Cut Strip", count: 2 },
  "4cut": { name: "4-Cut Grid", count: 4 },
  "8cut": { name: "8-Cut Grid", count: 8 },
}

export default function CapturePage() {
  const searchParams = useSearchParams()
  const layoutId = searchParams.get("layout") || "4cut"
  const propsParam = searchParams.get("props") || ""

  const layout = LAYOUTS[layoutId as keyof typeof LAYOUTS] || LAYOUTS["4cut"]
  const selectedProps = propsParam ? propsParam.split(",").filter(Boolean) : []

  const [currentShotIndex, setCurrentShotIndex] = useState(0)
  const [shots, setShots] = useState<CapturedShot[]>([])
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showRetakeModal, setShowRetakeModal] = useState(false)
  const [currentShot, setCurrentShot] = useState<CapturedShot | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const totalShots = layout.count
  const layoutName = layout.name

  useEffect(() => {
    // Initialize camera
    initializeCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Camera initialization error:", err)
    }
  }

  const startCountdown = () => {
    setIsCountingDown(true)
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          capturePhoto()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // TODO: Add props overlay here

    // Convert to image data
    const imageData = canvas.toDataURL("image/jpeg", 0.9)

    const newShot: CapturedShot = {
      id: `shot-${Date.now()}`,
      imageData,
      timestamp: Date.now(),
      retakeCount: 0,
    }

    setCurrentShot(newShot)
    setShowRetakeModal(true)
    setIsCountingDown(false)
  }

  const acceptShot = () => {
    if (!currentShot) return

    setShots((prev) => [...prev, currentShot])
    setCurrentShot(null)
    setShowRetakeModal(false)

    if (currentShotIndex + 1 < totalShots) {
      setCurrentShotIndex((prev) => prev + 1)
    }
  }

  const retakeShot = () => {
    if (!currentShot) return

    if (currentShot.retakeCount < 2) {
      setCurrentShot({
        ...currentShot,
        retakeCount: currentShot.retakeCount + 1,
      })
      setShowRetakeModal(false)
      // Camera is still active, ready for another shot
    } else {
      // Force accept if max retakes reached
      acceptShot()
    }
  }

  const canProceed = shots.length === totalShots

  const storePhotos = (photos: CapturedShot[]) => {
    const sessionId = `photobooth-${Date.now()}`
    localStorage.setItem(sessionId, JSON.stringify(photos))
    return sessionId
  }

  const handleContinueToStyles = () => {
    if (shots.length === totalShots) {
      const sessionId = storePhotos(shots)
      return `/styles?layout=${layoutId}&props=${selectedProps.join(",")}&session=${sessionId}`
    }
    return "#"
  }

  const canRetake = currentShot && currentShot.retakeCount < 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/camera" className="flex items-center gap-2 text-pink-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Camera</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Capture Photos</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-lg font-medium text-gray-900">Capture Sequence</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Shot Progress */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Photo {currentShotIndex + 1} of {totalShots}
          </h2>
          <p className="text-gray-600 mb-4">{layoutName}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: totalShots }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index < shots.length ? "bg-green-500" : index === currentShotIndex ? "bg-pink-500" : "bg-gray-300",
                )}
              />
            ))}
          </div>
        </div>

        {/* Camera Preview */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />

              {/* Countdown Overlay */}
              {isCountingDown && countdown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
                </div>
              )}

              {/* Props overlay */}
              {selectedProps.length > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90">
                    Props: {selectedProps.length} selected
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capture Controls */}
        <div className="text-center mb-8">
          {!showRetakeModal && (
            <Button
              size="lg"
              onClick={startCountdown}
              disabled={isCountingDown || canProceed}
              className="bg-pink-500 hover:bg-pink-600 text-xl px-12 py-6 rounded-full"
            >
              <Camera className="w-6 h-6 mr-3" />
              {isCountingDown ? "Get Ready..." : "Capture Photo"}
            </Button>
          )}
        </div>

        {/* Retake Modal */}
        {showRetakeModal && currentShot && (
          <Card className="max-w-md mx-auto mb-8 border-2 border-pink-200">
            <CardContent className="p-6 text-center">
              <img
                src={currentShot.imageData || "/placeholder.svg"}
                alt="Captured shot"
                className="w-full rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-4">How does this look?</h3>
              <div className="flex gap-3 justify-center">
                {canRetake && (
                  <Button variant="outline" onClick={retakeShot} className="flex-1 bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake ({2 - currentShot.retakeCount} left)
                  </Button>
                )}
                <Button onClick={acceptShot} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captured Shots Preview */}
        {shots.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Captured Photos ({shots.length}/{totalShots})
            </h3>
            <div
              className={cn(
                "gap-4 max-w-2xl mx-auto",
                totalShots === 1
                  ? "grid grid-cols-1"
                  : totalShots === 2
                    ? "grid grid-cols-2"
                    : totalShots === 4
                      ? "grid grid-cols-2"
                      : "grid grid-cols-2 md:grid-cols-4",
              )}
            >
              {shots.map((shot, index) => (
                <div key={shot.id} className="relative">
                  <img
                    src={shot.imageData || "/placeholder.svg"}
                    alt={`Shot ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-green-200"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link href="/camera">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Camera
            </Button>
          </Link>

          <Link href={canProceed ? handleContinueToStyles() : "#"}>
            <Button size="lg" disabled={!canProceed} className="bg-pink-500 hover:bg-pink-600">
              Continue to Styles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  )
}
