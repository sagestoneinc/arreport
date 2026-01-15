import ARUpdateForm from '@/components/ARUpdateForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 AR Update Generator
          </h1>
          <p className="text-gray-600">
            Generate Telegram-formatted Approval Rate updates
          </p>
        </div>
        <ARUpdateForm />
      </div>
    </main>
  )
}