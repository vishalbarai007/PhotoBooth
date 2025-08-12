import { Camera, Link } from 'lucide-react'
import React from 'react'

const Header = () => {
  return (
    <div>
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
    </div>
  )
}

export default Header
