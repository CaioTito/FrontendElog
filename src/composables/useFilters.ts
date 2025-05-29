import { ref, Ref, watch } from 'vue'

export interface FilterState {
  startDate?: string | null;
  endDate?: string | null;
  idTms?: string[];
  licensePlate?: string[];
  divisionId?: number[];
}

export function useFilters(): { filters: Ref<FilterState> } {
  const savedFiltersString = localStorage.getItem('filters')
  let initialFilters: FilterState

  const defaultDynamicFilters = getDefaultFilters(); // Obter os padrões dinâmicos (ontem/hoje)

  if (savedFiltersString) {
    try {
      const parsed = JSON.parse(savedFiltersString)
      // Se houver valores salvos para as datas, use-os, senão use os padrões dinâmicos.
      // Se parsed.startDate for explicitamente null ou undefined, mantenha, senão use default.
      initialFilters = {
        startDate: parsed.startDate !== undefined ? parsed.startDate : defaultDynamicFilters.startDate,
        endDate: parsed.endDate !== undefined ? parsed.endDate : defaultDynamicFilters.endDate,
        idTms: Array.isArray(parsed.idTms) ? parsed.idTms : (parsed.idTms ? [String(parsed.idTms)] : []),
        licensePlate: Array.isArray(parsed.licensePlate) ? parsed.licensePlate : (parsed.licensePlate ? [String(parsed.licensePlate)] : []),
        divisionId: Array.isArray(parsed.divisionId) ? parsed.divisionId.map(Number) : (parsed.divisionId ? [Number(parsed.divisionId)] : []),
      }
    } catch (e) {
      console.error('Erro ao parsear filtros do localStorage, usando padrão:', e)
      initialFilters = defaultDynamicFilters;
    }
  } else {
    initialFilters = defaultDynamicFilters;
  }

  const filters = ref<FilterState>(initialFilters)
  
  watch(filters, (newFilters) => {
    // Ao salvar, se startDate ou endDate for uma string vazia, salve como null/undefined para consistência
    const filtersToSave = {
      ...newFilters,
      startDate: newFilters.startDate || null, // Converte string vazia para null
      endDate: newFilters.endDate || null,     // Converte string vazia para null
    };
    localStorage.setItem('filters', JSON.stringify(filtersToSave))
  }, { deep: true })

  return { filters }
}

function getDefaultFilters(): FilterState {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return {
    startDate: yesterday.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    idTms: [],
    licensePlate: [],
    divisionId: []
  }
}
