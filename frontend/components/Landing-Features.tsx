// import { Sparkles, Camera, Download } from 'lucide-react'
// import React from 'react'

// const LandingFeatures = () => {
//   return (
//     <div>
//        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
//             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
//               <Sparkles className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
//               <h3 className="font-semibold mb-2">Fun Props</h3>
//               <p className="text-sm text-white/80">Choose from dozens of props or upload your own</p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
//               <Camera className="w-8 h-8 mx-auto mb-4 text-pink-300" />
//               <h3 className="font-semibold mb-2">Multiple Layouts</h3>
//               <p className="text-sm text-white/80">Single shots, strips, or classic photo booth grids</p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
//               <Download className="w-8 h-8 mx-auto mb-4 text-blue-300" />
//               <h3 className="font-semibold mb-2">Easy Sharing</h3>
//               <p className="text-sm text-white/80">Download or share instantly on social media</p>
//             </div>
//           </div>
//     </div>
//   )
// }

// export default LandingFeatures


import { Sparkles, Camera, Download } from 'lucide-react'
import React from 'react'

const LandingFeatures = () => {
  return (
      <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
        {/* Fun Props Card */}
        <div className="group relative cursor-pointer">
          {/* Subtle glowing border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc8e90] to-[#e8a598] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          {/* Card content */}
          <div className="relative bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/30 transform transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-lg">
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-yellow-300 drop-shadow" />
            <h3 className="font-bold mb-2 text-white text-lg">Fun Props</h3>
            <p className="text-sm text-white font-medium">Choose from dozens of props or upload your own</p>
          </div>
        </div>

        {/* Multiple Layouts Card */}
        <div className="group relative cursor-pointer">
          {/* Subtle glowing border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#b8a9c9] to-[#c4b5d6] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          {/* Card content */}
          <div className="relative bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/30 transform transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-lg">
            <Camera className="w-8 h-8 mx-auto mb-4 text-pink-200 drop-shadow" />
            <h3 className="font-bold mb-2 text-white text-lg">Multiple Layouts</h3>
            <p className="text-sm text-white font-medium">Single shots, strips, or classic photo booth grids</p>
          </div>
        </div>

        {/* Easy Sharing Card */}
        <div className="group relative cursor-pointer">
          {/* Subtle glowing border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8c4a2] to-[#b5d1af] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          {/* Card content */}
          <div className="relative bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/30 transform transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-lg">
            <Download className="w-8 h-8 mx-auto mb-4 text-blue-200 drop-shadow" />
            <h3 className="font-bold mb-2 text-white text-lg">Easy Sharing</h3>
            <p className="text-sm text-white font-medium">Download or share instantly on social media</p>
          </div>
        </div>
      </div>
  )
}

export default LandingFeatures
