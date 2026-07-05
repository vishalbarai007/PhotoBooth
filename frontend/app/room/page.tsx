"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sour_Gummy } from 'next/font/google'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Users, Globe } from "lucide-react"

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
})

export default function RoomEntryPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [roomCodeInput, setRoomCodeInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleCreateRoom = async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      // We will generate the room code via socket on the active room page.
      // So we can just redirect to a page with a flag to create a room.
      // E.g., /room/create?username=XYZ
      const name = username.trim() || "Host"
      router.push(`/room/create?username=${encodeURIComponent(name)}`)
    } catch (err) {
      setErrorMessage("Failed to create room. Please try again.")
      setIsLoading(false)
    }
  }

  const handleJoinRoom = () => {
    const code = roomCodeInput.trim().toUpperCase()
    if (!code) {
      setErrorMessage("Please enter a valid room code.")
      return;
    }
    if (code.length !== 6) {
      setErrorMessage("Room code must be exactly 6 characters.")
      return;
    }

    setIsLoading(true)
    setErrorMessage("")
    const name = username.trim() || "Guest"
    router.push(`/room/${code}?username=${encodeURIComponent(name)}&join=true`)
  }

  return (
    <div className={`${sourGummy.className} min-h-screen bg-[#ffc5a6] flex flex-col`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-pink-600 self-start sm:self-auto">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600 animate-spin-slow" />
            Long Distance Room
          </h1>
          <div className="hidden sm:block w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Create Room Card */}
          <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create a Room</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Generate a unique secure room code. Share the code with your partner so they can join you in a shared capture session.
                </p>
 
                <div className="space-y-2 mb-6">
                  <Label htmlFor="create-username" className="text-gray-700 text-sm font-semibold">Your Nickname</Label>
                  <Input
                    id="create-username"
                    placeholder="Enter nickname (e.g. Vishal)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    maxLength={15}
                  />
                </div>
              </div>
 
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 sm:py-6 rounded-xl text-base sm:text-lg mt-4 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Create Room & Generate Code
              </Button>
            </CardContent>
          </Card>
 
          {/* Join Room Card */}
          <Card className="border-2 border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join a Room</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Enter the room code shared by your partner to connect and snap photos together in a single custom card.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="join-username" className="text-gray-700 text-sm font-semibold">Your Nickname</Label>
                    <Input
                      id="join-username"
                      placeholder="Enter nickname (e.g. Shravani)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room-code" className="text-gray-700 text-sm font-semibold">Room Code (6 digits)</Label>
                    <Input
                      id="room-code"
                      placeholder="Enter Code (e.g. AB12XY)"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      className="text-center font-mono text-xl tracking-widest border-gray-300 focus:border-pink-500 focus:ring-pink-500 uppercase"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center mb-4">
                  {errorMessage}
                </div>
              )}

              <Button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-5 sm:py-6 rounded-xl text-base sm:text-lg shadow-lg transition-transform hover:scale-[1.02]"
              >
                Join Friend's Room
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
