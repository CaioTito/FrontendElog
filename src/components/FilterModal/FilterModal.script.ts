import { ref, watch, computed, PropType } from 'vue';

// Interface para os filtros, pode ser movida para um arquivo de tipos se usada em outros lugares.
interface FilterValues {
  startDate: string;
  endDate: string;
  fleet: string;
  licensePlate: string;
  division: string | number; // A API espera string ou number? O v-select usa `id` (number) para `item-value`.
}

// Interface para os itens de divisão, se precisar ser mais específica.
interface DivisionItem {
  id: number;
  label: string;
}

export default {
  name: 'FilterModal',
  props: {
    open: Boolean,
    modelValue: {
      type: Object as PropType<Partial<FilterValues>>,
      default: () => ({})
    }
  },
  emits: ['update:open', 'apply'],
  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.open,
      set: (value: boolean) => emit('update:open', value)
    });

    // Inicializar localFilters com valores padrão e depois mesclar com modelValue
    const localFilters = ref<FilterValues>({
      startDate: '',
      endDate: '',
      fleet: '',
      licensePlate: '',
      division: '', // Default para division, pode ser null ou um ID padrão se aplicável
      ...props.modelValue
    });

    const divisions: DivisionItem[] = [
      { id: 39, label: 'Citrosuco' },
      { id: 42, label: 'GLP' },
      { id: 45, label: 'Amônia' },
      { id: 46, label: 'Máquinas' },
      { id: 55, label: 'Ácido' },
      { id: 58, label: 'Treinamento' }
    ];

    // Observar mudanças no modelValue para atualizar localFilters
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        localFilters.value = { 
          startDate: newValue.startDate || '',
          endDate: newValue.endDate || '',
          fleet: newValue.fleet || '',
          licensePlate: newValue.licensePlate || '',
          division: newValue.division || '' 
        };
      }
    }, { deep: true, immediate: true }); // immediate para carregar na inicialização e deep para objetos aninhados se houver

    function closeModal() {
      dialog.value = false;
    }

    function apply() {
      emit('apply', { ...localFilters.value });
      closeModal();
    }

    return {
      dialog,
      localFilters,
      divisions,
      closeModal,
      apply
    };
  }
}; 