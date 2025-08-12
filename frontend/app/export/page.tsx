"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Twitter, Facebook, Instagram, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CapturedShot {
  id: string
  imageData: string
  timestamp: number
  retakeCount: number
}

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: string
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "jpg",
    name: "JPEG",
    extension: "jpg",
    description: "Best for sharing online",
    icon: "🖼️",
  },
  {
    id: "png",
    name: "PNG",
    extension: "png",
    description: "High quality with transparency",
    icon: "🎨",
  },
  {
    id: "pdf",
    name: "PDF",
    extension: "pdf",
    description: "Perfect for printing",
    icon: "📄",
  },
  {
    id: "webp",
    name: "WebP",
    extension: "webp",
    description: "Modern web format",
    icon: "🌐",
  },
]

const FRAMES = {
  none: { name: "No Frame", style: "border-0", bgColor: "transparent" },
  polaroid: { name: "Polaroid", style: "border-8 border-white shadow-lg", bgColor: "#ffffff" },
  polka: { name: "Polka Dots", style: "border-4 border-pink-300", bgColor: "#fce7f3" },
  neon: { name: "Neon Glow", style: "border-2 border-pink-400 shadow-lg shadow-pink-300/50", bgColor: "#ffffff" },
  vintage: { name: "Vintage", style: "border-4 border-amber-200", bgColor: "#fef3c7" },
  minimal: { name: "Minimalist", style: "border border-gray-300", bgColor: "#ffffff" },
  heart: { name: "Heart Border", style: "border-4 border-pink-400", bgColor: "#fdf2f8" },
  rainbow: { name: "Rainbow", style: "border-4", bgColor: "#ffffff" },
}

const LAYOUTS = {
  full: { name: "Full Photo", count: 1 },
  "2cut": { name: "2-Cut Strip", count: 2 },
  "4cut": { name: "4-Cut Grid", count: 4 },
  "8cut": { name: "8-Cut Grid", count: 8 },
}

export default function ExportPage() {
  const searchParams = useSearchParams()
  const layoutId = searchParams.get("layout") || "4cut"
  const propsParam = searchParams.get("props") || ""
  const frameId = searchParams.get("frame") || "polaroid"
  const caption = searchParams.get("caption") || ""
  const sessionId = searchParams.get("session") || ""

  const [selectedFormat, setSelectedFormat] = useState<string>("jpg")
  const [isGenerating, setIsGenerating] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedShot[]>([])
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const layout = LAYOUTS[layoutId as keyof typeof LAYOUTS] || LAYOUTS["4cut"]
  const frame = FRAMES[frameId as keyof typeof FRAMES] || FRAMES.polaroid
  const selectedProps = propsParam ? propsParam.split(",").filter(Boolean) : []

  useEffect(() => {
    // Load captured photos from localStorage
    if (sessionId) {
      const storedPhotos = localStorage.getItem(sessionId)
      if (storedPhotos) {
        const photos = JSON.parse(storedPhotos) as CapturedShot[]
        setCapturedPhotos(photos)
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (capturedPhotos.length > 0) {
      generateComposite()
    }
  }, [capturedPhotos, layoutId, frameId, caption])

  const generateComposite = async () => {
    if (!canvasRef.current || capturedPhotos.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on layout
    const baseWidth = 800
    const baseHeight = layoutId === "full" ? 800 : layoutId === "2cut" ? 1200 : layoutId === "4cut" ? 800 : 1600

    canvas.width = baseWidth
    canvas.height = baseHeight

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, baseWidth, baseHeight)

    // Apply frame background first
    applyFrameBackground(ctx, baseWidth, baseHeight)

    // Calculate photo dimensions and positions
    const framePadding = getFramePadding(frameId)
    const padding = 40 + framePadding
    const captionHeight = caption ? 60 : 0
    const availableWidth = baseWidth - padding * 2
    const availableHeight = baseHeight - padding * 2 - captionHeight

    const cols = layoutId === "full" ? 1 : layoutId === "2cut" ? 1 : 2
    const rows = Math.ceil(layout.count / cols)

    const photoSpacing = 10
    const photoWidth = (availableWidth - photoSpacing * (cols - 1)) / cols
    const photoHeight = (availableHeight - photoSpacing * (rows - 1)) / rows

    // Load and draw each captured photo
    const imagePromises = capturedPhotos.slice(0, layout.count).map((shot, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = padding + col * (photoWidth + photoSpacing)
          const y = padding + row * (photoHeight + photoSpacing)

          // Draw the photo
          ctx.drawImage(img, x, y, photoWidth, photoHeight)
          resolve()
        }
        img.onerror = () => {
          console.error(`Failed to load image ${index}`)
          resolve()
        }
        img.src = shot.imageData
      })
    })

    // Wait for all images to load
    await Promise.all(imagePromises)

    // Add caption if present
    if (caption) {
      ctx.font = "bold 24px Arial"
      ctx.fillStyle = "#374151"
      ctx.textAlign = "center"
      ctx.fillText(caption, baseWidth / 2, baseHeight - 20)
    }

    // Apply frame border and effects
    applyFrameEffects(ctx, baseWidth, baseHeight)

    // Generate preview
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setPreviewUrl(dataUrl)

    // Also update preview canvas for display
    if (previewCanvasRef.current) {
      const previewCanvas = previewCanvasRef.current
      const previewCtx = previewCanvas.getContext("2d")
      if (previewCtx) {
        const scale = 0.5
        previewCanvas.width = baseWidth * scale
        previewCanvas.height = baseHeight * scale
        previewCtx.drawImage(canvas, 0, 0, baseWidth * scale, baseHeight * scale)
      }
    }
  }

  const getFramePadding = (frameId: string): number => {
    switch (frameId) {
      case "polaroid":
        return 20
      case "vintage":
        return 15
      case "polka":
      case "heart":
      case "rainbow":
        return 10
      case "neon":
        return 8
      case "minimal":
        return 2
      default:
        return 0
    }
  }

  const applyFrameBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (frameId) {
      case "polaroid":
        // White polaroid background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        break
      case "polka":
        // Pink polka dot background
        const gradient1 = ctx.createLinearGradient(0, 0, width, height)
        gradient1.addColorStop(0, "#fce7f3")
        gradient1.addColorStop(1, "#fdf2f8")
        ctx.fillStyle = gradient1
        ctx.fillRect(0, 0, width, height)
        // Add polka dots
        ctx.fillStyle = "#f9a8d4"
        for (let x = 20; x < width; x += 40) {
          for (let y = 20; y < height; y += 40) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
        break
      case "vintage":
        // Vintage sepia background
        const gradient2 = ctx.createLinearGradient(0, 0, width, height)
        gradient2.addColorStop(0, "#fef3c7")
        gradient2.addColorStop(1, "#fde68a")
        ctx.fillStyle = gradient2
        ctx.fillRect(0, 0, width, height)
        break
      case "heart":
        // Pink heart background
        const gradient3 = ctx.createLinearGradient(0, 0, width, height)
        gradient3.addColorStop(0, "#fdf2f8")
        gradient3.addColorStop(1, "#fce7f3")
        ctx.fillStyle = gradient3
        ctx.fillRect(0, 0, width, height)
        break
      case "rainbow":
        // Rainbow gradient background
        const gradient4 = ctx.createLinearGradient(0, 0, width, 0)
        gradient4.addColorStop(0, "#fecaca")
        gradient4.addColorStop(0.2, "#fed7aa")
        gradient4.addColorStop(0.4, "#fef3c7")
        gradient4.addColorStop(0.6, "#d1fae5")
        gradient4.addColorStop(0.8, "#dbeafe")
        gradient4.addColorStop(1, "#e0e7ff")
        ctx.fillStyle = gradient4
        ctx.fillRect(0, 0, width, height)
        break
      default:
        // Default white background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
    }
  }

  const applyFrameEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (frameId) {
      case "polaroid":
        // Thick white border with shadow effect
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 40
        ctx.strokeRect(20, 20, width - 40, height - 40)

        // Add shadow effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 5
        ctx.shadowOffsetY = 5
        ctx.strokeRect(20, 20, width - 40, height - 40)
        ctx.shadowColor = "transparent"
        break

      case "neon":
        // Neon glow effect
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 4
        ctx.shadowColor = "#f472b6"
        ctx.shadowBlur = 15
        ctx.strokeRect(10, 10, width - 20, height - 20)

        // Inner glow
        ctx.strokeStyle = "#ec4899"
        ctx.lineWidth = 2
        ctx.shadowBlur = 8
        ctx.strokeRect(12, 12, width - 24, height - 24)
        ctx.shadowColor = "transparent"
        break

      case "vintage":
        // Vintage ornate border
        ctx.strokeStyle = "#d97706"
        ctx.lineWidth = 12
        ctx.strokeRect(15, 15, width - 30, height - 30)

        // Inner decorative border
        ctx.strokeStyle = "#92400e"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(25, 25, width - 50, height - 50)
        ctx.setLineDash([])
        break

      case "polka":
        // Pink dotted border
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 8
        ctx.strokeRect(10, 10, width - 20, height - 20)
        break

      case "heart":
        // Pink heart border
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 8
        ctx.strokeRect(10, 10, width - 20, height - 20)

        // Add heart decorations in corners
        ctx.fillStyle = "#ec4899"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("💕", 40, 40)
        ctx.fillText("💕", width - 40, 40)
        ctx.fillText("💕", 40, height - 20)
        ctx.fillText("💕", width - 40, height - 20)
        break

      case "rainbow":
        // Rainbow border
        const borderWidth = 12
        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]
        colors.forEach((color, index) => {
          ctx.strokeStyle = color
          ctx.lineWidth = borderWidth / colors.length
          const offset = index * (borderWidth / colors.length)
          ctx.strokeRect(offset, offset, width - offset * 2, height - offset * 2)
        })
        break

      case "minimal":
        // Simple thin border
        ctx.strokeStyle = "#6b7280"
        ctx.lineWidth = 2
        ctx.strokeRect(5, 5, width - 10, height - 10)
        break

      case "none":
      default:
        // No frame
        break
    }
  }

  const downloadImage = async (format: string) => {
    if (!canvasRef.current || !previewUrl) return

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      let dataUrl: string
      let filename: string

      switch (format) {
        case "png":
          dataUrl = canvas.toDataURL("image/png")
          filename = `photobooth-${Date.now()}.png`
          break
        case "webp":
          dataUrl = canvas.toDataURL("image/webp", 0.9)
          filename = `photobooth-${Date.now()}.webp`
          break
        case "pdf":
          // For PDF, we'll download as high-quality JPEG
          // In a real app, you'd use jsPDF library
          dataUrl = canvas.toDataURL("image/jpeg", 1.0)
          filename = `photobooth-${Date.now()}.jpg`
          break
        default:
          dataUrl = canvas.toDataURL("image/jpeg", 0.9)
          filename = `photobooth-${Date.now()}.jpg`
      }

      // Create download link
      const link = document.createElement("a")
      link.download = filename
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareToSocial = (platform: string) => {
    const text = `Check out my PhotoBooth creation! ${caption ? `"${caption}"` : ""}`
    const url = window.location.href

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case "instagram":
        copyImageToClipboard()
        break
    }
  }

  const copyImageToClipboard = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      })
    } catch (error) {
      console.error("Failed to copy image:", error)
    }
  }

  if (capturedPhotos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Photos Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find your captured photos. Please go back and take some photos first.
            </p>
            <Link href="/capture">
              <Button className="bg-pink-500 hover:bg-pink-600">Back to Capture</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/styles?layout=${layoutId}&props=${propsParam}&session=${sessionId}`}
            className="flex items-center gap-2 text-pink-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Styles</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Export & Download</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              5
            </div>
            <span className="text-lg font-medium text-gray-900">Export & Download</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full w-full"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your PhotoBooth Creation</h2>
              <p className="text-gray-600">
                Here's your final photo strip with your captured photos and selected frame.
              </p>
            </div>

            {/* Final Preview */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Your PhotoBooth Creation"
                      className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: "500px" }}
                    />
                  ) : (
                    <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Compositing your photos...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">{layout.name}</Badge>
                  <Badge variant="secondary">{frame.name}</Badge>
                  <Badge variant="secondary">{capturedPhotos.length} Photos</Badge>
                  {selectedProps.length > 0 && <Badge variant="secondary">{selectedProps.length} Props</Badge>}
                  {caption && <Badge variant="secondary">Custom Caption</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Individual Photos Preview */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Your Captured Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {capturedPhotos.slice(0, layout.count).map((shot, index) => (
                    <div key={shot.id} className="relative">
                      <img
                        src={shot.imageData || "/placeholder.svg"}
                        alt={`Captured photo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded border"
                      />
                      <Badge className="absolute top-1 left-1 text-xs">{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Download Options */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Options</h2>
              <p className="text-gray-600">Choose your preferred format and download your creation.</p>
            </div>

            {/* Format Selection */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Select Format</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {EXPORT_FORMATS.map((format) => (
                    <Card
                      key={format.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:scale-105",
                        selectedFormat === format.id ? "ring-2 ring-pink-500 bg-pink-50" : "hover:shadow-md",
                      )}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{format.icon}</div>
                        <h4 className="font-semibold text-sm mb-1">{format.name}</h4>
                        <p className="text-xs text-gray-600">{format.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Download Button */}
                <Button
                  size="lg"
                  onClick={() => downloadImage(selectedFormat)}
                  disabled={isGenerating || !previewUrl}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-lg py-6"
                >
                  <Download className="w-5 h-5 mr-3" />
                  {isGenerating ? "Generating..." : `Download as ${selectedFormat.toUpperCase()}`}
                </Button>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Share Your Creation</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial("twitter")}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial("facebook")}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial("instagram")}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyImageToClipboard}
                    className="flex items-center gap-2 bg-transparent"
                    disabled={!previewUrl}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Image"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      🎉 Create Another PhotoBooth
                    </Button>
                  </Link>
                  <Link href="/gallery" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      🖼️ View Gallery (Coming Soon)
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Hidden canvases for image generation */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={previewCanvasRef} className="hidden" />
      </main>
    </div>
  )
}
