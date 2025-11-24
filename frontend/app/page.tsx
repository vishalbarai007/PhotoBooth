// app/page.tsx

import { Sour_Gummy } from 'next/font/google'
import Link from "next/link"
import Hero from "@/components/Hero"
import LandingFeatures from "@/components/Landing-Features"
// import Footer from "@/components/Footer"
import Startbutton from "@/components/Startbutton"
// import Header from "@/components/Header"
import { Camera } from "lucide-react"

// ✅ MUST be outside the component
const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
})

export default function LandingPage() {
  return (
    <div className={`${sourGummy.className} min-h-screen  bg-[url('/Images/leave1.png')] bg-cover bg-center bg-no-repeat bg-[#DC8E90] flex flex-col`}>

      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Camera className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">PhotoBooth</h1>
        </div>
        <nav className="hidden md:flex gap-6 text-white">
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/Signin" className="hover:text-white transition-colors">
            Account
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* grid1 */}
          <div
            className="p-10">
            <div className="text-center max-w-4xl">
              <Hero />
              <LandingFeatures />
              <Link href="/setup">
                <Startbutton />
              </Link>
            </div>
          </div>

          {/* grid2 */}
          {/* Image Stack with Hover Effect */}
          <div className="flex items-center justify-center relative group h-[500px]">
            <img
              src="/Images/Landing1.png"
              alt="Photo Booth"
              className="w-full max-w-md rounded-lg shadow-lg absolute z-20 transition-transform duration-500 group-hover:scale-110"
            />
            <img
              src="/Images/Landing2.png"
              alt="Photo Booth"
              className="w-full max-w-md rounded-lg shadow-lg absolute z-0 rotate-12 transform translate-x-28 translate-y-20 opacity-70 transition-transform duration-500 group-hover:rotate-[18deg]"
            />
            <img
              src="/Images/Landing2.png"
              alt="Photo Booth"
              className="w-full max-w-md rounded-lg shadow-lg absolute z-0 -rotate-12 transform -translate-x-28 translate-y-20 opacity-70 transition-transform duration-500 group-hover:-rotate-[18deg]"
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-white/60 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="hover:text-white/80 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/80 transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-white/80 transition-colors">
            Contact
          </Link>
        </div>
        <p>&copy; 2025 PhotoBooth. Capture your moments.</p>
        <p>&copy; Made with ❤️ by Vishal & Shravani.</p>
        <p>&copy; Made with ❤️ by Vishal & Shravani.</p>


      </footer>
    </div>
  )
}
