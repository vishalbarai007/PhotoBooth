// "use client"

// import { useRef, useEffect, useState, useCallback } from "react"
// import { Canvas, useThree } from "@react-three/fiber"
// import * as THREE from "three"
// import { FaceMesh } from "@mediapipe/face_mesh"
// import { Camera } from "@mediapipe/camera_utils"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { ArrowLeft, CameraIcon, RotateCcw, Download } from "lucide-react"
// import Link from "next/link"
// import { useSearchParams } from "next/navigation"

// interface FaceLandmarks {
//   x: number
//   y: number
//   z: number
// }

// interface PropData {
//   id: string
//   name: string
//   emoji: string
//   category: string
//   position: "glasses" | "hat" | "mustache" | "crown" | "mask"
// }

// const PROPS_DATA: PropData[] = [
//   { id: "glasses1", name: "Sunglasses", emoji: "🕶️", category: "glasses", position: "glasses" },
//   { id: "glasses2", name: "Nerd Glasses", emoji: "🤓", category: "glasses", position: "glasses" },
//   { id: "hat1", name: "Party Hat", emoji: "🎉", category: "hats", position: "hat" },
//   { id: "hat2", name: "Top Hat", emoji: "🎩", category: "hats", position: "hat" },
//   { id: "crown1", name: "Crown", emoji: "👑", category: "hats", position: "crown" },
//   { id: "mustache1", name: "Mustache", emoji: "👨", category: "facial", position: "mustache" },
//   { id: "mask1", name: "Face Mask", emoji: "😷", category: "facial", position: "mask" },
// ]

// // Sunglasses 3D Component
// function Sunglasses({
//   position,
//   rotation,
//   scale,
// }: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
//   return (
//     <group position={position} rotation={rotation} scale={scale}>
//       {/* Left lens */}
//       <mesh position={[-0.3, 0, 0]}>
//         <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
//         <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
//       </mesh>
//       {/* Right lens */}
//       <mesh position={[0.3, 0, 0]}>
//         <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
//         <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
//       </mesh>
//       {/* Bridge */}
//       <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
//         <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
//         <meshBasicMaterial color="#333" />
//       </mesh>
//       {/* Left arm */}
//       <mesh position={[-0.45, 0, -0.3]} rotation={[0, Math.PI / 4, 0]}>
//         <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
//         <meshBasicMaterial color="#333" />
//       </mesh>
//       {/* Right arm */}
//       <mesh position={[0.45, 0, -0.3]} rotation={[0, -Math.PI / 4, 0]}>
//         <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
//         <meshBasicMaterial color="#333" />
//       </mesh>
//     </group>
//   )
// }

// // Party Hat 3D Component
// function PartyHat({
//   position,
//   rotation,
//   scale,
// }: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
//   return (
//     <group position={position} rotation={rotation} scale={scale}>
//       <mesh>
//         <coneGeometry args={[0.3, 0.8, 8]} />
//         <meshBasicMaterial color="#ff6b9d" />
//       </mesh>
//       <mesh position={[0, 0.4, 0]}>
//         <sphereGeometry args={[0.05]} />
//         <meshBasicMaterial color="#fff" />
//       </mesh>
//     </group>
//   )
// }

// // Crown 3D Component
// function Crown({
//   position,
//   rotation,
//   scale,
// }: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
//   return (
//     <group position={position} rotation={rotation} scale={scale}>
//       {/* Base ring */}
//       <mesh>
//         <torusGeometry args={[0.35, 0.05, 8, 16]} />
//         <meshBasicMaterial color="#ffd700" />
//       </mesh>
//       {/* Crown points */}
//       {[0, 1, 2, 3, 4].map((i) => (
//         <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 5) * 0.35, 0.2, Math.sin((i * Math.PI * 2) / 5) * 0.35]}>
//           <coneGeometry args={[0.08, 0.3, 6]} />
//           <meshBasicMaterial color="#ffd700" />
//         </mesh>
//       ))}
//     </group>
//   )
// }

// // Mustache 3D Component
// function Mustache({
//   position,
//   rotation,
//   scale,
// }: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
//   return (
//     <group position={position} rotation={rotation} scale={scale}>
//       <mesh position={[-0.15, 0, 0]}>
//         <sphereGeometry args={[0.1, 8, 6]} />
//         <meshBasicMaterial color="#4a4a4a" />
//       </mesh>
//       <mesh position={[0.15, 0, 0]}>
//         <sphereGeometry args={[0.1, 8, 6]} />
//         <meshBasicMaterial color="#4a4a4a" />
//       </mesh>
//       <mesh position={[0, -0.05, 0]} scale={[1.5, 0.5, 1]}>
//         <sphereGeometry args={[0.12, 8, 6]} />
//         <meshBasicMaterial color="#4a4a4a" />
//       </mesh>
//     </group>
//   )
// }

// // Face Mask 3D Component
// function FaceMask({
//   position,
//   rotation,
//   scale,
// }: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
//   return (
//     <group position={position} rotation={rotation} scale={scale}>
//       <mesh>
//         <planeGeometry args={[0.8, 0.4]} />
//         <meshBasicMaterial color="#87ceeb" transparent opacity={0.9} />
//       </mesh>
//       {/* Ear loops */}
//       <mesh position={[-0.4, 0.1, -0.2]}>
//         <torusGeometry args={[0.08, 0.01, 4, 16]} />
//         <meshBasicMaterial color="#fff" />
//       </mesh>
//       <mesh position={[0.4, 0.1, -0.2]}>
//         <torusGeometry args={[0.08, 0.01, 4, 16]} />
//         <meshBasicMaterial color="#fff" />
//       </mesh>
//     </group>
//   )
// }

// // 3D Props Renderer
// function PropsRenderer({
//   landmarks,
//   selectedProps,
//   videoWidth,
//   videoHeight,
// }: {
//   landmarks: FaceLandmarks[] | null
//   selectedProps: string[]
//   videoWidth: number
//   videoHeight: number
// }) {
//   const { camera } = useThree()

//   useEffect(() => {
//     // Set up orthographic camera to match video dimensions
//     if (camera instanceof THREE.OrthographicCamera) {
//       camera.left = -videoWidth / 2
//       camera.right = videoWidth / 2
//       camera.top = videoHeight / 2
//       camera.bottom = -videoHeight / 2
//       camera.updateProjectionMatrix()
//     }
//   }, [camera, videoWidth, videoHeight])

//   if (!landmarks || landmarks.length === 0) return null

//   // Key landmark indices for MediaPipe Face Mesh
//   const leftEye = landmarks[33] // Left eye center
//   const rightEye = landmarks[263] // Right eye center
//   const noseTip = landmarks[1] // Nose tip
//   const upperLip = landmarks[13] // Upper lip center
//   const forehead = landmarks[10] // Forehead center
//   const chin = landmarks[175] // Chin center

//   // Calculate face orientation
//   const eyeCenter = {
//     x: (leftEye.x + rightEye.x) / 2,
//     y: (leftEye.y + rightEye.y) / 2,
//     z: (leftEye.z + rightEye.z) / 2,
//   }

//   const faceWidth = Math.abs(rightEye.x - leftEye.x)
//   const scale = faceWidth * 2

//   // Convert normalized coordinates to world coordinates
//   const toWorldCoords = (landmark: FaceLandmarks) =>
//     [(landmark.x - 0.5) * videoWidth, (0.5 - landmark.y) * videoHeight, landmark.z * 100] as [number, number, number]

//   const eyeRotation: [number, number, number] = [0, 0, Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)]

//   return (
//     <>
//       {selectedProps.map((propId) => {
//         const propData = PROPS_DATA.find((p) => p.id === propId)
//         if (!propData) return null

//         switch (propData.position) {
//           case "glasses":
//             return <Sunglasses key={propId} position={toWorldCoords(eyeCenter)} rotation={eyeRotation} scale={scale} />
//           case "hat":
//             return (
//               <PartyHat
//                 key={propId}
//                 position={[toWorldCoords(forehead)[0], toWorldCoords(forehead)[1] + 50, toWorldCoords(forehead)[2]]}
//                 rotation={eyeRotation}
//                 scale={scale * 0.8}
//               />
//             )
//           case "crown":
//             return (
//               <Crown
//                 key={propId}
//                 position={[toWorldCoords(forehead)[0], toWorldCoords(forehead)[1] + 30, toWorldCoords(forehead)[2]]}
//                 rotation={eyeRotation}
//                 scale={scale * 0.6}
//               />
//             )
//           case "mustache":
//             return (
//               <Mustache key={propId} position={toWorldCoords(upperLip)} rotation={eyeRotation} scale={scale * 0.8} />
//             )
//           case "mask":
//             return (
//               <FaceMask
//                 key={propId}
//                 position={[toWorldCoords(noseTip)[0], toWorldCoords(noseTip)[1] - 20, toWorldCoords(noseTip)[2]]}
//                 rotation={eyeRotation}
//                 scale={scale}
//               />
//             )
//           default:
//             return null
//         }
//       })}
//     </>
//   )
// }

// export default function ARFaceFilter() {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const faceMeshRef = useRef<FaceMesh | null>(null)
//   const cameraRef = useRef<Camera | null>(null)

//   const [landmarks, setLandmarks] = useState<FaceLandmarks[] | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [videoSize, setVideoSize] = useState({ width: 640, height: 480 })
//   const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
//   const [isCapturing, setIsCapturing] = useState(false)

//   const searchParams = useSearchParams()
//   const selectedLayout = searchParams.get("layout") || "full"
//   const selectedProps = searchParams.get("props")?.split(",").filter(Boolean) || []

//   const initializeFaceDetection = useCallback(async () => {
//     try {
//       setIsLoading(true)

//       // Initialize MediaPipe Face Mesh
//       const faceMesh = new FaceMesh({
//         locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//       })

//       faceMesh.setOptions({
//         maxNumFaces: 1,
//         refineLandmarks: true,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       })

//       faceMesh.onResults((results) => {
//         if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//           setLandmarks(results.multiFaceLandmarks[0])
//         } else {
//           setLandmarks(null)
//         }
//       })

//       faceMeshRef.current = faceMesh

//       // Initialize camera
//       if (videoRef.current) {
//         const camera = new Camera(videoRef.current, {
//           onFrame: async () => {
//             if (faceMeshRef.current && videoRef.current) {
//               await faceMeshRef.current.send({ image: videoRef.current })
//             }
//           },
//           width: 640,
//           height: 480,
//         })

//         await camera.start()
//         cameraRef.current = camera

//         setVideoSize({ width: 640, height: 480 })
//         setIsLoading(false)
//       }
//     } catch (err) {
//       console.error("Failed to initialize face detection:", err)
//       setError("Failed to access camera or initialize face detection")
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     initializeFaceDetection()

//     return () => {
//       if (cameraRef.current) {
//         cameraRef.current.stop()
//       }
//     }
//   }, [initializeFaceDetection])

//   const capturePhoto = useCallback(() => {
//     if (!videoRef.current || !canvasRef.current) return

//     setIsCapturing(true)

//     const canvas = canvasRef.current
//     const video = videoRef.current
//     const ctx = canvas.getContext("2d")

//     if (ctx) {
//       canvas.width = video.videoWidth
//       canvas.height = video.videoHeight

//       // Draw the video frame
//       ctx.drawImage(video, 0, 0)

//       // Convert to data URL
//       const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9)
//       setCapturedPhotos((prev) => [...prev, photoDataUrl])
//     }

//     setTimeout(() => setIsCapturing(false), 200)
//   }, [])

//   const downloadPhoto = useCallback((photoUrl: string, index: number) => {
//     const link = document.createElement("a")
//     link.href = photoUrl
//     link.download = `photo-${index + 1}.jpg`
//     link.click()
//   }, [])

//   const resetPhotos = useCallback(() => {
//     setCapturedPhotos([])
//   }, [])

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-white">
//         <div className="text-center">
//           <p className="text-xl mb-4">Error: {error}</p>
//           <Button onClick={() => window.location.reload()}>Try Again</Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="relative min-h-screen bg-black overflow-hidden">
//       {/* Header */}
//       <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
//         <div className="flex items-center justify-between">
//           <Link href="/setup">
//             <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back
//             </Button>
//           </Link>
//           <div className="text-white text-center">
//             <p className="text-sm opacity-80">AR Face Filter</p>
//             <p className="text-xs opacity-60">{selectedProps.length} props active</p>
//           </div>
//           <div className="w-20" />
//         </div>
//       </div>

//       {/* Video Container */}
//       <div className="relative w-full h-screen flex items-center justify-center">
//         <video
//           ref={videoRef}
//           className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
//           playsInline
//           muted
//         />

//         {/* Three.js Overlay */}
//         <div className="absolute inset-0 pointer-events-none">
//           <Canvas
//             orthographic
//             camera={{
//               position: [0, 0, 100],
//               zoom: 1,
//             }}
//           >
//             <PropsRenderer
//               landmarks={landmarks}
//               selectedProps={selectedProps}
//               videoWidth={videoSize.width}
//               videoHeight={videoSize.height}
//             />
//           </Canvas>
//         </div>

//         {/* Loading Overlay */}
//         {isLoading && (
//           <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
//             <div className="text-white text-center">
//               <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
//               <p>Initializing AR Camera...</p>
//             </div>
//           </div>
//         )}

//         {/* Face Detection Status */}
//         <div className="absolute top-20 left-4 z-10">
//           <Badge variant={landmarks ? "default" : "secondary"} className="bg-black/50 text-white">
//             {landmarks ? "Face Detected" : "Looking for face..."}
//           </Badge>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
//         <div className="flex items-center justify-center gap-4">
//           <Button
//             onClick={resetPhotos}
//             variant="ghost"
//             size="lg"
//             className="text-white hover:bg-white/20"
//             disabled={capturedPhotos.length === 0}
//           >
//             <RotateCcw className="w-5 h-5" />
//           </Button>

//           <Button
//             onClick={capturePhoto}
//             size="lg"
//             className={`w-16 h-16 rounded-full bg-white hover:bg-gray-200 ${
//               isCapturing ? "scale-95" : "scale-100"
//             } transition-transform`}
//             disabled={isLoading}
//           >
//             <CameraIcon className="w-6 h-6 text-black" />
//           </Button>

//           <div className="text-white text-sm">
//             {capturedPhotos.length} /{" "}
//             {selectedLayout === "full" ? 1 : selectedLayout === "2cut" ? 2 : selectedLayout === "4cut" ? 4 : 8}
//           </div>
//         </div>
//       </div>

//       {/* Photo Gallery */}
//       {capturedPhotos.length > 0 && (
//         <div className="absolute top-20 right-4 z-20 max-w-xs">
//           <Card className="bg-black/80 border-white/20">
//             <CardContent className="p-4">
//               <h3 className="text-white font-medium mb-3">Captured Photos</h3>
//               <div className="grid grid-cols-2 gap-2 mb-3">
//                 {capturedPhotos.map((photo, index) => (
//                   <div key={index} className="relative group">
//                     <img
//                       src={photo || "/placeholder.svg"}
//                       alt={`Photo ${index + 1}`}
//                       className="w-full h-20 object-cover rounded border border-white/20"
//                     />
//                     <Button
//                       onClick={() => downloadPhoto(photo, index)}
//                       size="sm"
//                       variant="ghost"
//                       className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/70"
//                     >
//                       <Download className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//               <Button
//                 onClick={resetPhotos}
//                 variant="outline"
//                 size="sm"
//                 className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent"
//               >
//                 Clear All
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Hidden canvas for photo capture */}
//       <canvas ref={canvasRef} className="hidden" />
//     </div>
//   )
// }
