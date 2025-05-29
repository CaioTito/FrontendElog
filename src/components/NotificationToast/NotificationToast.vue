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

<script lang="ts" src="./NotificationToast.script.ts"></script>
<style scoped src="./NotificationToast.style.css"></style> 