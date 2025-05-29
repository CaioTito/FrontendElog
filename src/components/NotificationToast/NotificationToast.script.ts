import { useNotifications } from '../../composables/useNotifications'; // Ajustar caminho

export default {
  name: 'NotificationToast',
  setup() {
    const { notifications, removeNotification } = useNotifications();

    function getColor(type: string): string {
      switch (type) {
        case 'error': return 'error';
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
      }
    }

    function getIcon(type: string): string {
      switch (type) {
        case 'error': return 'mdi-alert-circle';
        case 'success': return 'mdi-check-circle';
        case 'warning': return 'mdi-alert';
        case 'info': return 'mdi-information';
        default: return 'mdi-information';
      }
    }

    function getIconColor(type: string): string {
      // Ícones parecem ser sempre brancos com base no código original
      return 'white'; 
    }

    return {
      notifications,
      removeNotification,
      getColor,
      getIcon,
      getIconColor
    };
  }
}; 