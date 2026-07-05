"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { io, Socket } from "socket.io-client"
import { Sour_Gummy } from 'next/font/google'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Camera, RotateCcw, Download, Copy, Check, Users, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Heart, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
})

// Props list for overlay
interface Prop {
  id: string
  name: string
  emoji: string
}

const PROPS: Prop[] = [
  { id: "hat1", name: "Party Hat", emoji: "🎉" },
  { id: "glasses1", name: "Sunglasses", emoji: "🕶️" },
  { id: "mustache1", name: "Mustache", emoji: "👨" },
  { id: "crown1", name: "Crown", emoji: "👑" },
  { id: "glasses2", name: "Nerd Glasses", emoji: "🤓" },
  { id: "bow1", name: "Bow Tie", emoji: "🎀" },
  { id: "emoji1", name: "Heart Eyes", emoji: "😍" },
  { id: "emoji2", name: "Cool", emoji: "😎" },
]

// Frame design configurations
interface Frame {
  id: string
  name: string
  preview: string
  bgColor: string
  style: string
}

const FRAMES: Frame[] = [
  { id: "polaroid", name: "Polaroid", preview: "⬜", bgColor: "#ffffff", style: "border-8 border-white shadow-lg" },
  { id: "polka", name: "Polka Dots", preview: "🔴", bgColor: "#fce7f3", style: "border-4 border-pink-300 bg-pink-100" },
  { id: "neon", name: "Neon Glow", preview: "✨", bgColor: "#1f2937", style: "border-2 border-pink-500 shadow-lg shadow-pink-500/50" },
  { id: "vintage", name: "Vintage", preview: "📸", bgColor: "#fef3c7", style: "border-4 border-amber-200" },
  { id: "minimal", name: "Minimalist", preview: "▫️", bgColor: "#ffffff", style: "border border-gray-300" },
  { id: "heart", name: "Heart Border", preview: "💕", bgColor: "#fdf2f8", style: "border-4 border-pink-400" },
  { id: "rainbow", name: "Rainbow", preview: "🌈", bgColor: "#ffffff", style: "border-4 border-transparent bg-gradient-to-r from-red-200 via-yellow-200 to-purple-200" }
]

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawRoomId = params?.roomId as string
  const isCreateFlow = rawRoomId === "create"
  const username = searchParams.get("username") || "User"
  const joinParam = searchParams.get("join") === "true"

  // Socket & Connection state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomState, setRoomState] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)
  const [partnerStatus, setPartnerStatus] = useState<string>("")
  const [isCopiedLink, setIsCopiedLink] = useState(false)

  // Camera & Stream state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState("")
  const [cameraLoading, setCameraLoading] = useState(false)
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null)

  // Capture & Sync states
  const [activeSlot, setActiveSlot] = useState<number | null>(null) // 0, 1, or 2
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showFlash, setShowFlash] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Sequence automation states
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const [sequenceStatus, setSequenceStatus] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderCanvasRef = useRef<HTMLCanvasElement>(null)

  // Refs to avoid stale closures in socket callbacks and async timers
  const socketRef = useRef<Socket | null>(null)
  const roomStateRef = useRef<any>(null)
  const selectedPropRef = useRef<Prop | null>(null)
  const performCaptureRef = useRef<(slotIndex: number) => void>(() => { })
  const triggerSyncCountdownRef = useRef<() => void>(() => { })

  // Synchronize state and functions to refs on every render
  const isSequenceActiveRef = useRef(false)

  useEffect(() => {
    isSequenceActiveRef.current = isSequenceActive
  }, [isSequenceActive])

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    roomStateRef.current = roomState
  }, [roomState])

  useEffect(() => {
    selectedPropRef.current = selectedProp
  }, [selectedProp])

  useEffect(() => {
    performCaptureRef.current = performCapture
    triggerSyncCountdownRef.current = triggerSyncCountdown
  })

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

  // Initialize socket connection
  useEffect(() => {
    // const socketClient = io(socketUrl, {
    //   transports: ["websocket"] // This is essential for Vercel/Render compatibility
    // })

    const socketClient = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });
    
    setSocket(socketClient)

    socketClient.on("connect", () => {
      console.log("Connected to socket server")
      if (isCreateFlow) {
        socketClient.emit("create_room", { username })
      } else {
        socketClient.emit("join_room", { roomId: rawRoomId.toUpperCase(), username })
      }
    })

    socketClient.on("room_created", (room) => {
      setRoomState(room)
      // Change route URL dynamically to reflect actual room code without reloading page
      window.history.replaceState(null, "", `/room/${room.roomId}?username=${encodeURIComponent(username)}`)
    })

    socketClient.on("room_joined", (room) => {
      setRoomState(room)
    })

    socketClient.on("room_updated", (room) => {
      setRoomState(room)
    })

    socketClient.on("partner_status_updated", ({ username, status }) => {
      setPartnerStatus(`${username}: ${status}`)
      setTimeout(() => setPartnerStatus(""), 4000)
    })

    socketClient.on("sync_countdown_started", () => {
      triggerSyncCountdownRef.current()
    })

    socketClient.on("room_reset", () => {
      setActiveSlot(null)
      setIsCountingDown(false)
      setCountdown(0)
    })

    socketClient.on("partner_disconnected", ({ message }) => {
      setPartnerStatus("Partner disconnected.")
      alert(message)
    })

    socketClient.on("error_message", ({ message }) => {
      setErrorMsg(message)
      alert(message)
      router.push("/room")
    })

    socketClient.on("connect_error", (err) => {
      console.error("Connection error:", err)
      setErrorMsg(`Failed to connect to the backend socket server. Please make sure the backend is running at: ${socketUrl}`)
    })

    // Setup local camera on mount
    requestCameraAccess()

    return () => {
      socketClient.disconnect()
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [rawRoomId])

  // Keep video ref updated when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, hasPermission])

  // Request local camera permission
  const requestCameraAccess = async () => {
    setCameraLoading(true)
    setCameraError("")
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      })
      setStream(mediaStream)
      setHasPermission(true)
    } catch (err) {
      console.error("Webcam error:", err)
      setHasPermission(false)
      setCameraError("Unable to access camera. Please check permissions.")
    } finally {
      setCameraLoading(false)
    }
  }

  // Socket state indicators
  const currentRoomCode = roomState?.roomId || ""
  const myUser = roomState?.users?.find((u: any) => u.id === socket?.id)
  const myRole = myUser?.role // 'creator' | 'joiner'
  const partnerUser = roomState?.users?.find((u: any) => u.id !== socket?.id)
  const isPartnerConnected = !!partnerUser

  // Photos lists
  const hostPhotos = roomState?.photos?.creator || [null, null, null]
  const guestPhotos = roomState?.photos?.joiner || [null, null, null]

  // Calculate my photos vs partner photos based on role
  const myPhotos = myRole === "creator" ? hostPhotos : guestPhotos
  const partnerPhotos = myRole === "creator" ? guestPhotos : hostPhotos

  // Manage automatic sequential capture for host
  useEffect(() => {
    if (myRole !== "creator" || !isSequenceActiveRef.current) return

    const creatorPhotos = roomState?.photos?.creator || [null, null, null]
    const joinerPhotos = roomState?.photos?.joiner || [null, null, null]

    // Check which slots are complete (both host and guest have captured)
    const slot0Complete = creatorPhotos[0] !== null && joinerPhotos[0] !== null
    const slot1Complete = creatorPhotos[1] !== null && joinerPhotos[1] !== null
    const slot2Complete = creatorPhotos[2] !== null && joinerPhotos[2] !== null

    // Determine the current step of the sequence
    if (slot0Complete && !slot1Complete && !isCountingDown && activeSlot === null) {
      // Slot 0 is done, but Slot 1 is not. Trigger Slot 1 after 3 seconds.
      setSequenceStatus("Pose for Photo 2! starting in 3s...")
      const timer = setTimeout(() => {
        setSequenceStatus("")
        if (socketRef.current && roomStateRef.current?.roomId) {
          socketRef.current.emit("start_sync_countdown", { roomId: roomStateRef.current.roomId })
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (slot0Complete && slot1Complete && !slot2Complete && !isCountingDown && activeSlot === null) {
      // Slot 1 is done, but Slot 2 is not. Trigger Slot 2 after 3 seconds.
      setSequenceStatus("Pose for Photo 3! starting in 3s...")
      const timer = setTimeout(() => {
        setSequenceStatus("")
        if (socketRef.current && roomStateRef.current?.roomId) {
          socketRef.current.emit("start_sync_countdown", { roomId: roomStateRef.current.roomId })
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (slot0Complete && slot1Complete && slot2Complete) {
      // All slots are completed! End sequence.
      setIsSequenceActive(false)
      setSequenceStatus("All photos captured! 🎉 Ready to download.")
      setTimeout(() => setSequenceStatus(""), 5000)
    }
  }, [roomState, myRole, isCountingDown, activeSlot])

  // Sync sequenceStatus changes as status updates to the partner
  useEffect(() => {
    if (sequenceStatus) {
      const activeSocket = socketRef.current
      const activeRoomCode = roomStateRef.current?.roomId || ""
      if (activeSocket && activeRoomCode) {
        activeSocket.emit("update_status", { roomId: activeRoomCode, status: sequenceStatus })
      }
    }
  }, [sequenceStatus])

  // Find next empty slot for capture
  const getNextEmptySlot = () => {
    for (let i = 0; i < 3; i++) {
      if (myPhotos[i] === null) return i
    }
    return null
  }

  // Count total shots captured
  const totalCaptured = hostPhotos.filter(Boolean).length + guestPhotos.filter(Boolean).length
  const allShotsTaken = hostPhotos.filter(Boolean).length === 3 && guestPhotos.filter(Boolean).length === 3

  // Copy room code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoomCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Copy Room Link to clipboard
  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${currentRoomCode}?username=Friend&join=true`
    navigator.clipboard.writeText(link)
    setIsCopiedLink(true)
    setTimeout(() => setIsCopiedLink(false), 2000)
  }

  // Handle capture sequences
  const triggerCapture = (slotIndex: number) => {
    if (isCountingDown) return
    setActiveSlot(slotIndex)
    setIsCountingDown(true)
    setCountdown(5)

    // Notify partner
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      activeSocket.emit("update_status", { roomId: activeRoomCode, status: `is taking a photo for slot ${slotIndex + 1}...` })
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          performCaptureRef.current(slotIndex)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Sync capture trigger
  const triggerSyncCapture = () => {
    if (!isPartnerConnected) {
      alert("Wait for your partner to join before running a synchronized capture!")
      return
    }
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      setIsSequenceActive(true)
      setSequenceStatus("Starting 3-photo capture sequence...")

      // Reset the room photos so the sequence starts clean from slot 0
      activeSocket.emit("reset_room", { roomId: activeRoomCode })

      setTimeout(() => {
        setSequenceStatus("")
        activeSocket.emit("start_sync_countdown", { roomId: activeRoomCode })
      }, 1000)
    }
  }

  // Sync countdown receiver
  const triggerSyncCountdown = () => {
    // Calculate the next empty slot using the latest roomState ref to avoid stale closure values
    const latestRoomState = roomStateRef.current
    const myUserObj = latestRoomState?.users?.find((u: any) => u.id === socketRef.current?.id)
    const myRoleStr = myUserObj?.role
    const hostPhotosList = latestRoomState?.photos?.creator || [null, null, null]
    const guestPhotosList = latestRoomState?.photos?.joiner || [null, null, null]
    const myPhotosList = myRoleStr === "creator" ? hostPhotosList : guestPhotosList

    let nextSlot = null
    for (let i = 0; i < 3; i++) {
      if (myPhotosList[i] === null) {
        nextSlot = i
        break
      }
    }

    if (nextSlot === null) {
      alert("All your slots are already captured. Clear or retake a photo to take new ones.")
      return
    }

    setActiveSlot(nextSlot)
    setIsCountingDown(true)
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          performCaptureRef.current(nextSlot)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Real capture drawing
  const performCapture = (slotIndex: number) => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video size
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Draw the image flipped horizontally (mirror effect)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform

    // Draw Emoji Prop Overlay if selected
    const activeProp = selectedPropRef.current
    if (activeProp) {
      ctx.font = "80px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      // Draw emoji at top center of photo
      ctx.fillText(activeProp.emoji, canvas.width / 2, canvas.height / 3.5)
    }

    // Flash screen effect
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 200)

    const imageData = canvas.toDataURL("image/jpeg", 0.9)

    // Send to room
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      activeSocket.emit("photo_captured", { roomId: activeRoomCode, index: slotIndex, imageData })
      activeSocket.emit("update_status", { roomId: activeRoomCode, status: `captured photo ${slotIndex + 1}! 📸` })
    }

    setIsCountingDown(false)
    setActiveSlot(null)
  }

  // Retake photo slot
  const handleRetake = (slotIndex: number) => {
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      activeSocket.emit("photo_retake", { roomId: activeRoomCode, index: slotIndex })
    }
  }

  // Sync style customizations
  const handleStyleChange = (frameId: string) => {
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      activeSocket.emit("update_style", { roomId: activeRoomCode, style: { frameId } })
    }
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.slice(0, 30)
    const activeSocket = socketRef.current
    const activeRoomCode = roomStateRef.current?.roomId || ""
    if (activeSocket && activeRoomCode) {
      activeSocket.emit("update_style", { roomId: activeRoomCode, style: { caption: text } })
    }
  }

  // Reset the entire room
  const handleResetSession = () => {
    if (confirm("Are you sure you want to clear all photos in this room and start over?")) {
      const activeSocket = socketRef.current
      const activeRoomCode = roomStateRef.current?.roomId || ""
      if (activeSocket && activeRoomCode) {
        activeSocket.emit("reset_room", { roomId: activeRoomCode })
      }
    }
  }

  // Download logic (Draw 2 columns and 3 rows on 800x1200 canvas)
  const downloadPhotocard = async () => {
    if (!renderCanvasRef.current || !allShotsTaken) return

    setIsDownloading(true)
    const canvas = renderCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const baseWidth = 800
    const baseHeight = 1200

    canvas.width = baseWidth
    canvas.height = baseHeight

    const frameId = roomState?.style?.frameId || "polaroid"
    const captionText = roomState?.style?.caption || ""
    const activeFrame = FRAMES.find((f) => f.id === frameId) || FRAMES[0]

    // 1. Draw Frame Background
    ctx.fillStyle = activeFrame.bgColor
    ctx.fillRect(0, 0, baseWidth, baseHeight)

    if (frameId === "polka") {
      ctx.fillStyle = "#f9a8d4"
      for (let x = 20; x < baseWidth; x += 40) {
        for (let y = 20; y < baseHeight; y += 40) {
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    // Border padding and layout math
    const padding = 30
    const spacing = 15
    const captionHeight = captionText ? 80 : 40

    const availableWidth = baseWidth - padding * 2
    const availableHeight = baseHeight - padding * 2 - captionHeight

    const colWidth = (availableWidth - spacing) / 2
    const rowHeight = (availableHeight - spacing * 2) / 3

    // Load images
    const loadImg = (src: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("Failed to load snapshot"))
        img.src = src
      })
    }

    try {
      // Load all 6 photos
      const loadedHostPhotos = await Promise.all(hostPhotos.map(loadImg))
      const loadedGuestPhotos = await Promise.all(guestPhotos.map(loadImg))

      // 2. Draw Photos Grid
      for (let row = 0; row < 3; row++) {
        // Col 1 (Host/Creator)
        const hostImg = loadedHostPhotos[row]
        const x1 = padding
        const y1 = padding + row * (rowHeight + spacing)
        ctx.drawImage(hostImg, x1, y1, colWidth, rowHeight)

        // Col 2 (Guest/Joiner)
        const guestImg = loadedGuestPhotos[row]
        const x2 = padding + colWidth + spacing
        const y2 = padding + row * (rowHeight + spacing)
        ctx.drawImage(guestImg, x2, y2, colWidth, rowHeight)
      }

      // 3. Draw Border Frame Effects
      ctx.shadowColor = "transparent"
      ctx.lineWidth = 0

      if (frameId === "polaroid") {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 16
        ctx.strokeRect(8, 8, baseWidth - 16, baseHeight - 16)
      } else if (frameId === "neon") {
        ctx.strokeStyle = "#ec4899"
        ctx.lineWidth = 8
        ctx.strokeRect(6, 6, baseWidth - 12, baseHeight - 12)
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 3
        ctx.strokeRect(10, 10, baseWidth - 20, baseHeight - 20)
      } else if (frameId === "vintage") {
        ctx.strokeStyle = "#d97706"
        ctx.lineWidth = 10
        ctx.strokeRect(5, 5, baseWidth - 10, baseHeight - 10)
        ctx.strokeStyle = "#92400e"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 6])
        ctx.strokeRect(14, 14, baseWidth - 28, baseHeight - 28)
        ctx.setLineDash([])
      } else if (frameId === "heart") {
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 8
        ctx.strokeRect(5, 5, baseWidth - 10, baseHeight - 10)
        ctx.fillStyle = "#ec4899"
        ctx.font = "32px Arial"
        ctx.fillText("💕", 25, 45)
        ctx.fillText("💕", baseWidth - 65, 45)
        ctx.fillText("💕", 25, baseHeight - 25)
        ctx.fillText("💕", baseWidth - 65, baseHeight - 25)
      } else if (frameId === "rainbow") {
        const gradient = ctx.createLinearGradient(0, 0, baseWidth, 0)
        gradient.addColorStop(0, "#ef4444")
        gradient.addColorStop(0.2, "#f97316")
        gradient.addColorStop(0.4, "#eab308")
        gradient.addColorStop(0.6, "#22c55e")
        gradient.addColorStop(0.8, "#3b82f6")
        gradient.addColorStop(1, "#8b5cf6")
        ctx.strokeStyle = gradient
        ctx.lineWidth = 12
        ctx.strokeRect(6, 6, baseWidth - 12, baseHeight - 12)
      } else if (frameId === "minimal") {
        ctx.strokeStyle = "#9ca3af"
        ctx.lineWidth = 2
        ctx.strokeRect(4, 4, baseWidth - 8, baseHeight - 8)
      }

      // 4. Draw Caption Text
      if (captionText) {
        ctx.font = "bold 32px Arial"
        ctx.fillStyle = frameId === "neon" ? "#ffffff" : "#1f2937"
        ctx.textAlign = "center"
        ctx.fillText(captionText, baseWidth / 2, baseHeight - 40)
      }

      // Trigger download
      const downloadUrl = canvas.toDataURL("image/jpeg", 0.95)
      const link = document.createElement("a")
      link.download = `photobooth-room-${currentRoomCode}-${Date.now()}.jpg`
      link.href = downloadUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Rendering error:", err)
      alert("Failed to render and download your card. Please verify permissions.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Quick fallback if room error
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Error Connecting</h2>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <Link href="/room">
              <Button className="bg-pink-500 hover:bg-pink-600">Back to Lobby</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${sourGummy.className} min-h-screen bg-[#ffc5a6] flex flex-col relative`}>
      {/* Visual Flash effect overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/room" className="flex items-center gap-2 text-pink-600 self-start sm:self-auto">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit Room</span>
          </Link>
 
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center justify-center gap-2 text-center">
            <span>🌐 Long Distance Room:</span>
            <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{currentRoomCode || "..."}</span>
          </h1>
 
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <Button size="sm" variant="outline" onClick={handleCopyCode} className="bg-white flex-1 sm:flex-initial flex items-center justify-center gap-1">
              {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              <span>{copiedCode ? "Copied" : "Copy Code"}</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="bg-white flex-1 sm:flex-initial flex items-center justify-center gap-1">
              {isCopiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Users className="w-4 h-4 text-gray-500" />}
              <span>{isCopiedLink ? "Copied Link" : "Invite Partner"}</span>
            </Button>
          </div>
        </div>
      </header>
 
      {/* Partner join status notification toast bar */}
      <div className="bg-purple-100 text-purple-800 text-xs sm:text-sm font-semibold py-2 px-4 sm:px-6 flex flex-col sm:flex-row gap-2 sm:justify-between items-center border-b border-purple-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full inline-block shrink-0", isPartnerConnected ? "bg-green-500 animate-pulse" : "bg-orange-500 animate-ping")} />
          <span>
            {isPartnerConnected
              ? `Connected with ${partnerUser?.username || "Friend"} 🟢`
              : "Waiting for partner to join... Share your Room Code!"
            }
          </span>
        </div>
        {partnerStatus && (
          <span className="text-xs bg-purple-200 text-purple-900 px-2 py-0.5 rounded animate-bounce">
            {partnerStatus}
          </span>
        )}
      </div>
 
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
 
        {/* LEFT COLUMN: Camera feed & Capture controls (Lg: col-span-7) */}
        <div className="contents lg:flex lg:flex-col lg:col-span-7 gap-6 w-full">
 
          {/* Camera Card */}
          <Card className="order-1 w-full shadow-lg overflow-hidden border-2 border-white/80 bg-white/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-600" />
                  Your Camera View
                </h2>
                {selectedProp && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 flex items-center gap-1">
                    Prop Active: {selectedProp.emoji}
                    <button onClick={() => setSelectedProp(null)} className="text-red-500 hover:text-red-700 ml-1 font-bold">×</button>
                  </Badge>
                )}
              </div>

              {/* Webcam viewport container */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video max-h-[380px] w-full flex items-center justify-center shadow-inner">
                {hasPermission && stream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />

                    {/* Mirroring grid lines overlay */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl" />

                    {/* Countdown Overlay */}
                    {isCountingDown && countdown > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <div className="text-white text-9xl font-extrabold animate-ping">
                          {countdown}
                        </div>
                      </div>
                    )}

                    {/* Sequence Status Message Overlay */}
                    {sequenceStatus && !isCountingDown && (
                      <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold px-6 py-3 rounded-2xl border-2 border-white shadow-2xl text-xl flex items-center gap-2 animate-bounce">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                          {sequenceStatus}
                        </div>
                      </div>
                    )}

                    {/* Prop overlay in live video preview */}
                    {selectedProp && (
                      <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 text-8xl pointer-events-none animate-bounce">
                        {selectedProp.emoji}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 text-white">
                    {cameraLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-12 h-12 animate-spin text-pink-500" />
                        <p>Accessing camera stream...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <AlertTriangle className="w-16 h-16 text-yellow-500" />
                        <p className="text-sm text-gray-300">{cameraError || "Camera permission is required."}</p>
                        <Button onClick={requestCameraAccess} className="bg-pink-500 hover:bg-pink-600">
                          Allow Camera Access
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emoji Props selection bar */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Choose overlay prop:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {PROPS.map((prop) => (
                    <Button
                      key={prop.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProp(selectedProp?.id === prop.id ? null : prop)}
                      className={cn(
                        "text-2xl px-3 py-4 bg-white/50 border hover:bg-pink-50 rounded-xl transition-all",
                        selectedProp?.id === prop.id ? "ring-2 ring-pink-500 bg-pink-50" : ""
                      )}
                    >
                      {prop.emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capture Actions control center */}
          <Card className="order-2 w-full shadow-lg border-2 border-white/80 bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-center">Capture Controls</h3>
 
              <div className="grid md:grid-cols-2 gap-4">
                {/* Individual capture button */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      const next = getNextEmptySlot()
                      if (next !== null) triggerCapture(next)
                      else alert("All your photo slots are captured. Retake a photo to take another one!")
                    }}
                    disabled={isCountingDown || !hasPermission || getNextEmptySlot() === null}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-6 text-lg rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Local Slot
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Snap a photo for your next empty slot ({getNextEmptySlot() !== null ? `Slot ${getNextEmptySlot()! + 1}` : "all full"})
                  </p>
                </div>
 
                {/* Synced simultaneous capture button */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={triggerSyncCapture}
                    disabled={isCountingDown || !hasPermission || !isPartnerConnected || getNextEmptySlot() === null}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    <Sparkles className="w-5 h-5" />
                    Sync Capture (Both)
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Triggers a synchronized countdown for both users to pose together!
                  </p>
                </div>
              </div>
 
              {/* Progress feedback alerts */}
              {isCountingDown && (
                <Alert className="mt-4 bg-purple-50 border-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-800 font-semibold animate-pulse">
                    Capture in progress! Look at the camera lens... 📸
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
 
          {/* Styling customization controls (Shows up for both, synchronized) */}
          <Card className="order-4 w-full shadow-lg border-2 border-white/80 bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Shared Customizations</h3>
 
              {/* Frame selection */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Frame Design</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {FRAMES.map((frame) => (
                    <Button
                      key={frame.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStyleChange(frame.id)}
                      className={cn(
                        "flex flex-col gap-1 p-2 h-auto text-xs shrink-0 w-20 truncate bg-white/50 border hover:bg-purple-50",
                        roomState?.style?.frameId === frame.id ? "ring-2 ring-purple-600 bg-purple-50" : ""
                      )}
                    >
                      <span className="text-xl">{frame.preview}</span>
                      <span className="text-[10px] font-medium leading-none block">{frame.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
 
              {/* Custom caption text input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Custom Caption</label>
                <Input
                  placeholder="Enter caption (e.g. Summer Memories 2026)"
                  value={roomState?.style?.caption || ""}
                  onChange={handleCaptionChange}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-center font-semibold"
                  maxLength={30}
                />
                <p className="text-[10px] text-gray-400 text-right">Max 30 characters. Syncs in real time.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Shared 2x3 Photocard Display (Lg: col-span-5) */}
        <div className="contents lg:flex lg:flex-col lg:col-span-5 gap-6 lg:items-center w-full">

          {/* Shared Photocard Section */}
          <div className="order-3 w-full flex flex-col items-center gap-4 lg:order-none">
            {/* Header titles */}
            <div className="text-center w-full mb-1">
              <h2 className="text-2xl font-bold text-gray-900">Shared Photocard</h2>
              <p className="text-sm text-gray-700">Photos taken instantly sync onto the card</p>
            </div>

            {/* Photocard layout view */}
            <div className="relative w-full max-w-[360px] aspect-[2/3] transition-all duration-300">
            {/* Find current frame styling */}
            {(() => {
              const activeFrameId = roomState?.style?.frameId || "polaroid"
              const activeFrame = FRAMES.find((f) => f.id === activeFrameId) || FRAMES[0]
              const captionText = roomState?.style?.caption || ""

              return (
                <div
                  className={cn(
                    "w-full h-full rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl p-4 transition-all duration-300 border-4 border-white/60",
                    activeFrameId === "rainbow" ? "bg-gradient-to-br from-red-100 via-yellow-100 to-purple-100" : ""
                  )}
                  style={{
                    backgroundColor: activeFrameId !== "rainbow" ? activeFrame.bgColor : undefined,
                    borderColor: activeFrameId === "polaroid" ? "#ffffff" : undefined
                  }}
                >
                  {/* The 2-column by 3-row photo grid */}
                  <div className="grid grid-cols-2 gap-2.5 h-full items-stretch">

                    {/* COLUMN 1: Creator / Host (User 1) */}
                    <div className="flex flex-col gap-2.5 justify-around h-full">
                      <div className="text-center text-[10px] text-gray-500 font-bold tracking-wider leading-none py-1 border-b border-dashed border-gray-300">
                        {roomState?.users?.find((u: any) => u.role === "creator")?.username || "Host"}
                      </div>

                      {[0, 1, 2].map((idx) => (
                        <div
                          key={`host-${idx}`}
                          className={cn(
                            "relative aspect-[4/5] bg-gray-200/60 rounded-lg overflow-hidden border border-gray-300/40 flex flex-col items-center justify-center group shadow-sm transition-all",
                            activeSlot === idx && myRole === "creator" ? "ring-4 ring-pink-500" : ""
                          )}
                        >
                          {hostPhotos[idx] ? (
                            <>
                              <img
                                src={hostPhotos[idx]}
                                alt={`Host photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {myRole === "creator" && (
                                <button
                                  onClick={() => handleRetake(idx)}
                                  className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Retake Photo"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-center p-2">
                              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1 animate-pulse" />
                              <span className="text-[10px] text-gray-500 font-medium block">Slot {idx + 1}</span>
                              {myRole === "creator" && (
                                <button
                                  onClick={() => triggerCapture(idx)}
                                  disabled={isCountingDown}
                                  className="mt-1 text-[8px] bg-pink-500 text-white px-2 py-0.5 rounded font-bold hover:bg-pink-600 transition"
                                >
                                  Snap
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* COLUMN 2: Joiner / Guest (User 2) */}
                    <div className="flex flex-col gap-2.5 justify-around h-full">
                      <div className="text-center text-[10px] text-gray-500 font-bold tracking-wider leading-none py-1 border-b border-dashed border-gray-300">
                        {roomState?.users?.find((u: any) => u.role === "joiner")?.username || "Guest"}
                      </div>

                      {[0, 1, 2].map((idx) => (
                        <div
                          key={`guest-${idx}`}
                          className={cn(
                            "relative aspect-[4/5] bg-gray-200/60 rounded-lg overflow-hidden border border-gray-300/40 flex flex-col items-center justify-center group shadow-sm transition-all",
                            activeSlot === idx && myRole === "joiner" ? "ring-4 ring-pink-500" : ""
                          )}
                        >
                          {guestPhotos[idx] ? (
                            <>
                              <img
                                src={guestPhotos[idx]}
                                alt={`Guest photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {myRole === "joiner" && (
                                <button
                                  onClick={() => handleRetake(idx)}
                                  className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Retake Photo"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-center p-2">
                              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1 animate-pulse" />
                              <span className="text-[10px] text-gray-500 font-medium block">Slot {idx + 1}</span>
                              {myRole === "joiner" && (
                                <button
                                  onClick={() => triggerCapture(idx)}
                                  disabled={isCountingDown}
                                  className="mt-1 text-[8px] bg-pink-500 text-white px-2 py-0.5 rounded font-bold hover:bg-pink-600 transition"
                                >
                                  Snap
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Caption Text output */}
                  {captionText && (
                    <div className="mt-3 text-center border-t border-dashed border-gray-300/40 pt-2 leading-none">
                      <p className={cn(
                        "text-xs font-bold font-mono tracking-wider",
                        activeFrameId === "neon" ? "text-pink-400" : "text-gray-800"
                      )}>
                        {captionText}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
          </div>

          {/* Action and download buttons */}
          <div className="order-5 w-full max-w-[360px] flex flex-col gap-2.5 lg:order-none">
            {/* Download Button */}
            <Button
              onClick={downloadPhotocard}
              disabled={!allShotsTaken || isDownloading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Photocard...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Photocard
                </>
              )}
            </Button>

            {/* Clear/Reset Button */}
            <Button
              variant="outline"
              onClick={handleResetSession}
              disabled={totalCaptured === 0}
              className="w-full bg-transparent hover:bg-red-50 text-red-500 hover:text-red-600 border-red-200 py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              Reset Photos & Card
            </Button>
          </div>
        </div>

      </main>

      {/* Hidden capture support canvas elements */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={renderCanvasRef} className="hidden" />
    </div>
  )
}
