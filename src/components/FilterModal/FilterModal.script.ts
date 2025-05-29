import { ref, watch, computed, PropType } from 'vue';
import type { FilterState } from '../../composables/useFilters'; // Importar FilterState

// Interface para os filtros, pode ser movida para um arquivo de tipos se usada em outros lugares.

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
      type: Object as PropType<Partial<FilterState>>,
      default: () => ({ // Valores padrão para FilterState, datas serão undefined por padrão de useFilters
        startDate: undefined,
        endDate: undefined,
        idTms: [],
        licensePlate: [],
        divisionId: []
      })
    }
  },
  emits: ['update:open', 'apply'],
  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.open,
      set: (value: boolean) => emit('update:open', value)
    });

    // Inicializar localFilters com base em modelValue, ou undefined para datas
    const localFilters = ref<FilterState>({
      startDate: props.modelValue?.startDate || undefined,
      endDate: props.modelValue?.endDate || undefined,
      idTms: Array.isArray(props.modelValue?.idTms) ? [...props.modelValue.idTms] : [],
      licensePlate: Array.isArray(props.modelValue?.licensePlate) ? [...props.modelValue.licensePlate] : [],
      divisionId: Array.isArray(props.modelValue?.divisionId) ? [...props.modelValue.divisionId] : []
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
          startDate: newValue.startDate || undefined,
          endDate: newValue.endDate || undefined,
          idTms: Array.isArray(newValue.idTms) ? [...newValue.idTms] : [],
          licensePlate: Array.isArray(newValue.licensePlate) ? [...newValue.licensePlate] : [],
          divisionId: Array.isArray(newValue.divisionId) ? [...newValue.divisionId] : []
        };
      }
    }, { deep: true, immediate: true }); // immediate para carregar na inicialização e deep para objetos aninhados se houver

    function closeModal() {
      dialog.value = false;
    }

    function apply() {
      const filtersToEmit: Partial<FilterState> = {};

      filtersToEmit.startDate = localFilters.value.startDate ? localFilters.value.startDate : undefined;
      filtersToEmit.endDate = localFilters.value.endDate ? localFilters.value.endDate : undefined;
      
      // Sempre emitir os campos de array, mesmo que vazios, para que OdometerView possa registar a limpeza.
      filtersToEmit.idTms = localFilters.value.idTms || []; 
      filtersToEmit.licensePlate = localFilters.value.licensePlate || [];
      filtersToEmit.divisionId = localFilters.value.divisionId || [];

      // Filtrar chaves que são arrays vazios para não enviar ex: { idTms: [] } se não for desejado explicitamente
      // No entanto, para o caso de limpar um filtro, precisamos enviar o array vazio.
      // A lógica em OdometerView.script.ts (apiParams) já lida com não enviar arrays vazios para a API.
      // Então, aqui, vamos emitir os arrays como estão (podem ser vazios).

      emit('apply', filtersToEmit);
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