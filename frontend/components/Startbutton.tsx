import { Link, Camera } from 'lucide-react'
import React from 'react'
// import { Button } from 'react-day-picker'
import { Button } from "@/components/ui/button"


const Startbutton = () => {
    return (
        <div>
            <Button className="bg-white text-pink-600 hover:bg-white/90 text-xl px-12 py-6 rounded-full font-bold shadow-2xl transform hover:scale-105 transition-all duration-200">
                <Camera className="w-6 h-6 mr-3" />
                Start PhotoBooth
            </Button>
        </div>
    )
}

export default Startbutton
