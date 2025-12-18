export default function ProcessingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Spinning Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Main Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing document and extracting guidance...</h2>
          <p className="text-sm text-muted-foreground">This usually takes 10-30 seconds</p>
        </div>
      </div>
    </div>
  )
}
