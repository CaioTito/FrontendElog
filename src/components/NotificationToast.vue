<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :timeout="notification.timeout"
      :color="getColor(notification.type)"
      location="top right"
      multi-line
      vertical
      class="notification-toast"
      @update:model-value="(value) => !value && removeNotification(notification.id)"
    >
      <div class="notification-content">
        <div class="notification-header">
          <v-icon :color="getIconColor(notification.type)" class="mr-2">
            {{ getIcon(notification.type) }}
          </v-icon>
          <span class="notification-title">{{ notification.title }}</span>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="removeNotification(notification.id)"
            class="ml-auto"
          >
            <v-icon size="small">mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="notification-message">
          {{ notification.message }}
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

function getColor(type: string) {
  switch (type) {
    case 'error': return 'error'
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'info'
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'error': return 'mdi-alert-circle'
    case 'success': return 'mdi-check-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    default: return 'mdi-information'
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'error': return 'white'
    case 'success': return 'white'
    case 'warning': return 'white'
    case 'info': return 'white'
    default: return 'white'
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-toast {
  pointer-events: auto;
  margin-bottom: 10px;
}

.notification-content {
  width: 100%;
}

.notification-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: bold;
  font-size: 1rem;
}

.notification-message {
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 300px;
}

/* Override Vuetify snackbar positioning for multiple toasts */
.notification-toast :deep(.v-snackbar__wrapper) {
  position: relative !important;
  margin-bottom: 10px;
}
</style> 