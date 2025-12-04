import { useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import { FileText } from 'lucide-react'

const MockTest = () => {
  const { showInfo } = useNotification()

  useEffect(() => {
    showInfo('This feature will be implemented in 8th semester')
  }, [showInfo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Mock Test</h1>
            <p className="text-lg text-slate-600 mb-8">
              This feature will be implemented in 8th semester
            </p>
            <div className="w-full max-w-md bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
              <p className="text-slate-700">
                Stay tuned for updates! The Mock Test feature is currently under development and will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockTest

