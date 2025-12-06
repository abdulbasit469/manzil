import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export function MBTIDetailsModal({ isOpen, onClose, mbtiType, details }) {
  if (!isOpen || !details) return null

  // Parse the details text into structured format
  const parseDetails = (text) => {
    if (!text) return { dimensionBreakdown: [], bulletPoints: [] }
    
    const lines = text.split('\n').filter(line => line.trim())
    const dimensionBreakdown = []
    const bulletPoints = []
    let foundDimensions = false
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      
      // Extract MBTI dimension breakdown (E -> Extraversion format)
      if (trimmed.includes('->') && trimmed.match(/^[ESTJINFPT]\s*->/)) {
        dimensionBreakdown.push(trimmed)
        foundDimensions = true
        return
      }
      
      // Skip dimension lines
      if (foundDimensions) {
        // Look for bullet points - can start with -, •, or just be a line after dimensions
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const item = trimmed.replace(/^[-•]\s*/, '').trim()
          if (item && item.length > 10) {
            bulletPoints.push(item)
          }
        } else if (trimmed.length > 15 && !trimmed.match(/^[ESTJINFPT]\s*->/)) {
          // If it's a substantial line after dimensions, treat it as a bullet point
          bulletPoints.push(trimmed)
        }
      }
    })
    
    // If we didn't find bullet points in expected format, extract from all non-dimension lines
    if (bulletPoints.length === 0 && foundDimensions) {
      lines.forEach((line) => {
        const trimmed = line.trim()
        if (trimmed.length > 15 && 
            !trimmed.match(/^[ESTJINFPT]\s*->/) && 
            !trimmed.includes('->')) {
          bulletPoints.push(trimmed)
        }
      })
    }
    
    return { dimensionBreakdown, bulletPoints: bulletPoints.slice(0, 4) }
  }

  const { dimensionBreakdown, bulletPoints } = parseDetails(details)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />
          
          {/* Modal - Centered on screen */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: 'auto',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
            <div className="w-full">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900">MBTI Type: {mbtiType}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="px-5 py-4">
                {/* MBTI Dimension Breakdown */}
                {dimensionBreakdown.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    {dimensionBreakdown.map((dim, idx) => (
                      <div key={idx} className="text-gray-700 text-sm">
                        {dim}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Bullet Points - Always show 4 */}
                {bulletPoints.length > 0 ? (
                  <div className="space-y-2">
                    {bulletPoints.map((item, itemIdx) => {
                      // Remove all asterisks, bold formatting, and special characters
                      let cleanItem = item.replace(/\*\*/g, '').replace(/\*/g, '').trim()
                      // Remove any leading dashes or bullet symbols from AI
                      cleanItem = cleanItem.replace(/^[-•]\s*/, '').trim()
                      const hasColon = cleanItem.includes(':')
                      const parts = hasColon ? cleanItem.split(':') : [null, cleanItem]
                      
                      return (
                        <div key={itemIdx} className="text-gray-700 text-sm leading-relaxed flex items-start">
                          <span className="text-gray-400 mr-2 mt-0.5">•</span>
                          <span className="flex-1">
                            {hasColon ? (
                              <>
                                <span className="font-medium text-gray-900">{parts[0]}:</span>
                                <span className="ml-1">{parts.slice(1).join(':').trim()}</span>
                              </>
                            ) : (
                              cleanItem
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  // Fallback: extract from raw text if parsing didn't work
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {details.split('\n').filter(line => {
                      const trimmed = line.trim()
                      return trimmed && 
                             !trimmed.match(/^[ESTJINFPT]\s*->/) && 
                             !trimmed.startsWith('*') &&
                             !trimmed.startsWith('-') &&
                             trimmed.length > 10
                    }).slice(0, 4).map((line, idx) => {
                      const cleanLine = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^[-•]\s*/, '').trim()
                      return cleanLine ? (
                        <div key={idx} className="flex items-start mb-2">
                          <span className="text-gray-400 mr-2 mt-0.5">•</span>
                          <span>{cleanLine}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

