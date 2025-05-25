
import { ref } from 'vue'

export function useFilters() {
  const saved = localStorage.getItem('filters')
  const filters = ref(saved ? JSON.parse(saved) : getDefault())

  function getDefault() {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    return {
      startDate: yesterday.toISOString(),
      endDate: today.toISOString(),
      licensePlate: [''],
      idTms: [''],
      divisionId: [],
      rows: 10,
      page: 1
    }
  }

  return { filters }
}
