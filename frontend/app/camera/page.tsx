"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Camera, AlertTriangle, RefreshCw } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function CameraPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const searchParams = useSearchParams()
  const layout = searchParams.get("layout") || "default"

  const requestCameraAccess = async () => {
    setIsLoading(true)
    setError("")

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      setStream(mediaStream)
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Camera access error:", err)
      setHasPermission(false)

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access was denied. Please allow camera access and try again.")
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.")
        } else if (err.name === "NotSupportedError") {
          setError("Camera is not supported on this device.")
        } else {
          setError("Failed to access camera. Please try again.")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setHasPermission(null)
  }

  useEffect(() => {
    // Check if device supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera is not supported on this device or browser.")
      setHasPermission(false)
    }

    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const canProceed = hasPermission && stream

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/setup" className="flex items-center gap-2 text-pink-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Setup</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Camera Setup</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-lg font-medium text-gray-900">Camera Permission & Preview</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-2/4"></div>
          </div>
        </div>

        {/* Camera Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Set Up Your Camera</h2>
          <p className="text-lg text-gray-600 mb-8">
            We need access to your camera to take amazing photos. Your privacy is important - photos are processed
            locally on your device.
          </p>

          {/* Camera Preview Area */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-8">
              {!hasPermission && !error && (
                <div className="text-center py-16">
                  <Camera className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Camera Preview</h3>
                  <p className="text-gray-500 mb-6">Click the button below to enable your camera</p>
                </div>
              )}

              {error && (
                <div className="text-center py-16">
                  <AlertTriangle className="w-24 h-24 text-red-300 mx-auto mb-6" />
                  <Alert className="max-w-md mx-auto">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {hasPermission && stream && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
                  />
                  {/* Crosshair overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 border-2 border-white/50 rounded-full"></div>
                    <div className="absolute w-16 h-0.5 bg-white/50"></div>
                    <div className="absolute w-0.5 h-16 bg-white/50"></div>
                  </div>
                  {/* Safe zone indicator */}
                  <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-lg pointer-events-none"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Camera Controls */}
          <div className="flex flex-col items-center gap-4">
            {!hasPermission && (
              <Button
                size="lg"
                onClick={requestCameraAccess}
                disabled={isLoading}
                className="bg-pink-500 hover:bg-purple-700 text-lg px-8 py-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Requesting Access...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-3" />
                    Allow Camera Access
                  </>
                )}
              </Button>
            )}

            {hasPermission && stream && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Camera is ready!</span>
                </div>
                <Button onClick={stopCamera} variant="outline" size="sm">
                  Stop Camera
                </Button>
              </div>
            )}

            {error && (
              <Button onClick={requestCameraAccess} variant="outline" size="lg" className="mt-4 bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <Card className="max-w-2xl mx-auto mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Make sure your browser supports camera access (Chrome, Firefox, Safari)</li>
              <li>• Check that no other apps are using your camera</li>
              <li>• Look for a camera permission prompt in your browser</li>
              <li>• Try refreshing the page if the camera doesn't appear</li>
            </ul>
          </CardContent>
        </Card>

        {layout && (
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-gray-700">Selected Layout: {layout}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link href="/setup">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
          </Link>

          <Link href={canProceed ? `/capture?layout=${layout}` : "#"}>
            <Button size="lg" disabled={!canProceed} className="bg-pink-500 hover:bg-purple-700">
              Ready to Capture
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
