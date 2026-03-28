export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Hvidbjerg Service</h1>
          <p className="text-blue-600 mt-1">Kundeportal</p>
        </div>
        {children}
      </div>
    </div>
  )
}
