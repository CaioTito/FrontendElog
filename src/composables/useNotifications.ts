import { ref } from 'vue'

interface Notification {
  id: string
  type: 'error' | 'success' | 'warning' | 'info'
  title: string
  message: string
  timeout?: number
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString()
    const newNotification = {
      ...notification,
      id,
      timeout: notification.timeout || 5000
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after timeout
    if (newNotification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }
    
    return id
  }
  
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function showError(title: string, message: string, timeout = 8000) {
    return addNotification({
      type: 'error',
      title,
      message,
      timeout
    })
  }
  
  function showSuccess(title: string, message: string, timeout = 3000) {
    return addNotification({
      type: 'success',
      title,
      message,
      timeout
    })
  }
  
  function showWarning(title: string, message: string, timeout = 5000) {
    return addNotification({
      type: 'warning',
      title,
      message,
      timeout
    })
  }
  
  function showInfo(title: string, message: string, timeout = 5000) {
    return addNotification({
      type: 'info',
      title,
      message,
      timeout
    })
  }
  
  function clearAll() {
    notifications.value = []
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearAll
  }
} 