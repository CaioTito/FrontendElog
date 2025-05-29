import { ref, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import FilterModal from '../../components/FilterModal/FilterModal.vue'
import ColumnConfigModal from '../../components/ColumnConfigModal/ColumnConfigModal.vue'
import NotificationToast from '../../components/NotificationToast/NotificationToast.vue'
import { useFilters, FilterState } from '../../composables/useFilters'
import { useNotifications } from '../../composables/useNotifications'
import { fetchOdometerData } from '../../services/apiService'
import type { OdometerDataItem } from '../../interfaces/response/odometerResponse'
import type { SimpleTableHeader, CurrentTableOptionsInitialization } from '../../interfaces/uiTypes'
import type { OdometerRequest } from '../../interfaces/request/odometerRequest'

export default {
  name: 'OdometerView',
  components: {
    FilterModal,
    ColumnConfigModal,
    NotificationToast
  },
  setup() {
    const { filters } = useFilters()
    const { showError } = useNotifications()
    const showFilter = ref<boolean>(false)
    const showConfigModal = ref<boolean>(false)
    const data = ref<OdometerDataItem[]>([])
    const loading = ref<boolean>(false)
    const totalItems = ref<number>(0)
    const isRequestInProgress = ref<boolean>(false)

    const ALL_POSSIBLE_ODOMETER_COLUMNS: ReadonlyArray<SimpleTableHeader> = [
      { title: 'Frota', value: 'vehicleIdTms' },
      { title: 'Operação', value: 'operationName' },
      { title: 'Divisão', value: 'divisionName' },
      { title: 'Placa', value: 'licensePlate' },
      { title: 'Hodômetro', value: 'odometerKm' },
      { title: 'Velocidade', value: 'speed' },
      { title: 'Status Veículo', value: 'moving' },
      { title: 'Status Ignição', value: 'ignitionStatus' },
      { title: 'Motorista', value: 'driverName' },
      { title: 'Data de Processamento', value: 'dateProcess' }
    ]

    const tableOptions = ref<CurrentTableOptionsInitialization>({
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      sortDesc: [],
      groupBy: [],
      groupDesc: [],
      multiSort: false,
      mustSort: false,
    })

    const headers = ref<SimpleTableHeader[]>([...ALL_POSSIBLE_ODOMETER_COLUMNS])
    const allHeaders: SimpleTableHeader[] = [...ALL_POSSIBLE_ODOMETER_COLUMNS]

    watch(() => tableOptions.value.page, (newPage, oldPage) => {
      if (oldPage !== undefined && newPage !== oldPage) {
        fetchData(filters.value)
      }
    })

    watch(() => tableOptions.value.itemsPerPage, (newItemsPerPage, oldItemsPerPage) => {
      if (oldItemsPerPage !== undefined && newItemsPerPage !== oldItemsPerPage) {
        fetchData(filters.value)
      }
    })

    async function fetchData(filtersToUse: FilterState) {
      if (isRequestInProgress.value) {
        return;
      }
      isRequestInProgress.value = true;
      loading.value = true;
      
      try {
        const apiParams: Partial<OdometerRequest> = {
          StartDate: filtersToUse.startDate,
          EndDate: filtersToUse.endDate,
          IdTms: filtersToUse.idTms,
          LicensePlate: filtersToUse.licensePlate,
          DivisionId: filtersToUse.divisionId,
          Rows: tableOptions.value.itemsPerPage,
          Page: tableOptions.value.page
        };

        Object.keys(apiParams).forEach(key => {
          const k = key as keyof OdometerRequest;
          const value = apiParams[k];
          if (value === undefined || (Array.isArray(value) && value.length === 0)) {
            delete apiParams[k];
          }
        });
        
        apiParams.Rows = apiParams.Rows ?? tableOptions.value.itemsPerPage;
        apiParams.Page = apiParams.Page ?? tableOptions.value.page;

        const responseData = await fetchOdometerData(apiParams as OdometerRequest);
        
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          data.value = responseData.data;
          totalItems.value = responseData.totalItems || 0;
        } else {
          console.warn('Dados recebidos da API não estão no formato esperado ou estão vazios. Resetando tabela.', responseData);
          data.value = [];
          totalItems.value = 0;
        }
        
      } catch (error) {
        console.error('Erro capturado no componente OdometerView ao buscar dados:', error);
        data.value = [];
        totalItems.value = 0;
      } finally {
        loading.value = false;
        isRequestInProgress.value = false;
      }
    }

    function applyFilters(newFiltersFromModal: Partial<FilterState>) {
      filters.value = { 
        ...filters.value, 
        ...newFiltersFromModal 
      };
      tableOptions.value.page = 1;
      fetchData(filters.value);
    }

    function formatOdometer(value: number | undefined): string {
      if (value === undefined || value === null) {
        return '-';
      }
      return `${value.toFixed(3).replace('.', ',')} Km`;
    }

    function formatSpeed(value: number | undefined): string {
      if (value === undefined || value === null) {
        return '-';
      }
      return `${value} km/h`;
    }

    function formatDriverName(name: string | undefined): string {
      if (!name || typeof name !== 'string') {
        return '-';
      }
      return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    function formatDate(date: string) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    }

    function updateVisibleColumns(newVisibleColumns: SimpleTableHeader[]) {
      headers.value = newVisibleColumns;
      localStorage.setItem('odometer-table-headers', JSON.stringify(newVisibleColumns));
    }

    onMounted(() => {
      const savedHeaders = localStorage.getItem('odometer-table-headers');
      if (savedHeaders) {
        try {
          const parsedSavedHeaders = JSON.parse(savedHeaders);
          const validSavedHeaders = parsedSavedHeaders.filter((sh: any) => 
            typeof sh.title === 'string' && 
            typeof sh.value === 'string' &&
            ALL_POSSIBLE_ODOMETER_COLUMNS.some(aph => aph.value === sh.value)
          );
          
          if (validSavedHeaders.length > 0) {
            headers.value = validSavedHeaders;
          } else {
            headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
          }
        } catch (e) {
          console.error('Erro ao parsear cabeçalhos salvos do localStorage:', e);
          headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
        }
      } else {
        headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
      }
      
      fetchData(filters.value);
    });

    return {
      filters,
      showError,
      showFilter,
      showConfigModal,
      data,
      loading,
      totalItems,
      ALL_POSSIBLE_ODOMETER_COLUMNS,
      tableOptions,
      headers,
      allHeaders,
      applyFilters,
      formatOdometer,
      formatSpeed,
      formatDriverName,
      formatDate,
      updateVisibleColumns,
      fetchData
    };
  }
} 