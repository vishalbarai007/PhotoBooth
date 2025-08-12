import { Link } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <div>
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
        <p>&copy; 2024 PhotoBooth. Capture your moments.</p>
      </footer>
    </div>
  )
}

export default Footer
