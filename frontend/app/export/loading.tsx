export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing your PhotoBooth creation...</p>
      </div>
    </div>
  )
}
