import { useState, useCallback } from 'react'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    resolve: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning'
  })

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmation({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message,
        resolve: resolve,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning'
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    if (confirmation.resolve) {
      confirmation.resolve(false)
    }
    setConfirmation(prev => ({ ...prev, isOpen: false, resolve: null }))
  }, [confirmation])

  const handleConfirm = useCallback(() => {
    if (confirmation.resolve) {
      confirmation.resolve(true)
    }
    setConfirmation(prev => ({ ...prev, isOpen: false, resolve: null }))
  }, [confirmation])

  const ConfirmationComponent = (
    <ConfirmationDialog
      isOpen={confirmation.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={confirmation.title}
      message={confirmation.message}
      confirmText={confirmation.confirmText}
      cancelText={confirmation.cancelText}
      type={confirmation.type}
    />
  )

  return { confirm, ConfirmationComponent }
}



