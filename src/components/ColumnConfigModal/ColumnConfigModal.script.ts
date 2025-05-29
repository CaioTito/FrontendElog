import { ref, computed, watch, PropType } from 'vue';
import type { SimpleTableHeader } from '../../interfaces/uiTypes'; // Ajustar caminho para uiTypes

export default {
  name: 'ColumnConfigModal',
  props: {
    open: Boolean,
    headers: {
      type: Array as PropType<SimpleTableHeader[]>,
      default: () => []
    },
    allHeaders: {
      type: Array as PropType<SimpleTableHeader[]>,
      default: () => []
    }
  },
  emits: ['update:open', 'apply-config'],
  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.open,
      set: (value) => emit('update:open', value)
    });

    const localVisibleColumns = ref<SimpleTableHeader[]>([]);
    const selectedColumnToAdd = ref<string | null>(null); // value é string

    const availableColumns = computed(() => {
      return props.allHeaders.filter(header => 
        !localVisibleColumns.value.some(visibleHeader => visibleHeader.value === header.value)
      );
    });

    watch(() => props.open, (isOpen) => {
      if (isOpen) {
        // Sempre copie da prop headers para garantir que o estado local seja resetado
        // se as props mudarem enquanto o modal está fechado e depois reaberto.
        localVisibleColumns.value = props.headers ? [...props.headers] : [];
      }
    }, { immediate: true }); // immediate: true para inicializar na primeira vez que o watcher é configurado se open já for true.

    function closeModal() {
      dialog.value = false;
    }

    function addColumn() {
      if (selectedColumnToAdd.value) {
        const columnToAdd = props.allHeaders.find(header => header.value === selectedColumnToAdd.value);
        if (columnToAdd && !localVisibleColumns.value.some(h => h.value === columnToAdd.value)) {
          localVisibleColumns.value.push(columnToAdd);
        }
        selectedColumnToAdd.value = null; // Clear selection
      }
    }

    function removeColumn(index: number) {
      localVisibleColumns.value.splice(index, 1);
    }

    function moveColumnUp(index: number) {
      if (index > 0) {
        const column = localVisibleColumns.value[index];
        localVisibleColumns.value.splice(index, 1);
        localVisibleColumns.value.splice(index - 1, 0, column);
      }
    }

    function moveColumnDown(index: number) {
      if (index < localVisibleColumns.value.length - 1) {
        const column = localVisibleColumns.value[index];
        localVisibleColumns.value.splice(index, 1);
        localVisibleColumns.value.splice(index + 1, 0, column);
      }
    }

    function applyConfig() {
      emit('apply-config', [...localVisibleColumns.value]); // Emitir uma cópia para evitar mutações inesperadas
      closeModal();
    }

    return {
      dialog,
      localVisibleColumns,
      selectedColumnToAdd,
      availableColumns,
      closeModal,
      addColumn,
      removeColumn,
      moveColumnUp,
      moveColumnDown,
      applyConfig
    };
  }
}; 