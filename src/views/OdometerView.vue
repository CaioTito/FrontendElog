<template>
  <div style="padding: 10px 0;">
    <v-container style="background-color: #e0e0e0;" class="px-4">
      <span style="font-size: 1.25rem; font-weight: 500;">TESTE TÉCNICO - BIGCORE</span>
    </v-container>
  </div>

  <v-container>
    <div class="d-flex align-center mb-4 mt-2">
      <span style="font-size: 1.5rem; font-weight: 500;">Consulta Hodômetro</span>
      <v-btn variant="text" class="ml-2" @click="showFilter = true">
        <v-icon color="black">mdi-filter</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn variant="text" class="ml-2" @click="showConfigModal = true">
        <v-icon color="black">mdi-cog</v-icon>
      </v-btn>
    </div>

    <FilterModal
      :open="showFilter"
      :model-value="filters"
      @update:open="showFilter = $event"
      @apply="fetchData"
    />

    <ColumnConfigModal
      :open="showConfigModal"
      @update:open="showConfigModal = $event"
      :headers="headers"
      :all-headers="allHeaders"
      @apply-config="updateVisibleColumns"
    />

    {{ console.log('Valor de footer-props sendo passado:', { itemsPerPageOptions: [10, 25, 50, 100], showFirstLastPage: true, showCurrentPage: true }) }}

    <v-card elevation="2">
      <v-data-table
        :items="data"
        :headers="headers"
        :items-length="totalItems"
        v-model:options="tableOptions"
        :items-per-page="tableOptions.itemsPerPage"
        :loading="loading"
        class="odometer-table"
      >
        <template #loading>
          <v-skeleton-loader
            v-for="n in 5"
            :key="n"
            type="table-row"
            class="my-2"
          />
        </template>

        <template #item.moving="{ item }">
          <span>{{ item.moving ? 'Em movimento' : 'Parado' }}</span>
        </template>

        <template #item.dateProcess="{ item }">
          <span>{{ formatDate(item.dateProcess) }}</span>
        </template>

        <template #bottom>
          <v-row class="pa-2">
            <v-spacer></v-spacer>
            <v-col cols="auto" md="auto" class="d-flex align-center">
              <div class="d-flex align-center justify-start">
                <span class="">Registros por página:</span>
                <v-select
                  v-model="tableOptions.itemsPerPage"
                  :items="[10, 15, 20]"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="ml-2 pagination-select"
                  style="width: 50px; min-width: 50px;"
                  @update:modelValue="newValue => {
                    console.log('Handler Select - novo valor recebido:', newValue);
                    tableOptions.itemsPerPage = newValue;
                    console.log('Handler Select - tableOptions.itemsPerPage após setar:', tableOptions.itemsPerPage);
                  }"
                ></v-select>
              </div>
            </v-col>
            <v-col cols="auto" md="auto" class="d-flex align-center justify-center pl-4 pr-4">
              <span class="">{{ totalItems === 0 ? '0-0 de 0' : `${(tableOptions.page - 1) * tableOptions.itemsPerPage + 1}-${Math.min(tableOptions.page * tableOptions.itemsPerPage, totalItems)} de ${totalItems}` }}</span>
            </v-col>
            <v-col cols="12" md="auto" class="d-flex align-center justify-end">
              <v-pagination
                v-model="tableOptions.page"
                :length="Math.ceil(totalItems / tableOptions.itemsPerPage)"
                :total-visible="5"
                density="compact"
                @update:modelValue="newPage => {
                  console.log('Handler Pagination - novo valor recebido:', newPage);
                  tableOptions.page = newPage;
                  console.log('Handler Pagination - tableOptions.page após setar:', tableOptions.page);
                }"
              ></v-pagination>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <!-- Notification Toast Component -->
  <NotificationToast />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import FilterModal from '../components/FilterModal.vue'
import ColumnConfigModal from '../components/ColumnConfigModal.vue'
import NotificationToast from '../components/NotificationToast.vue'
import { useFilters } from '../composables/useFilters'
import { useNotifications } from '../composables/useNotifications'

interface OdometerItem {
  vehicleIdTms: string
  operationName: string
  divisionName: string
  licensePlate: string
  odometerKm: number
  speed: number
  moving: boolean
  ignitionStatus: string
  driverName: string
  dateProcess: string
}

const { filters } = useFilters()
const { showError, showSuccess } = useNotifications()
const showFilter = ref(false)
const showConfigModal = ref(false)
const data = ref<OdometerItem[]>([])
const loading = ref(false)
const totalItems = ref(0)

const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: [],
  groupBy: [],
  groupDesc: [],
  multiSort: false,
  mustSort: false,
})

const headers = ref([
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
])

const allHeaders = [
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
];

watch(tableOptions, (newOptions) => {
  console.log('Watcher - tableOptions mudou (via v-model:options):', newOptions)
  filters.value.page = newOptions.page
  filters.value.rows = newOptions.itemsPerPage
  fetchData()
}, { deep: true })

async function fetchData(filtersRaw = filters.value) {
  loading.value = true
  try {
    const params = {
      StartDate: filtersRaw.startDate,
      EndDate: filtersRaw.endDate,
      IdTms: filtersRaw.fleet,
      LicensePlate: filtersRaw.licensePlate,
      DivisionId: filtersRaw.division,
      Rows: filtersRaw.rows ?? 10,
      Page: filtersRaw.page ?? 1
    }
    console.log('Parâmetros enviados para o backend:', params)
    const res = await axios.get('/api/odometer', { params })
    data.value = res.data.data
    totalItems.value = res.data.totalItems || res.data.data.length
    console.log('totalItems:', totalItems.value, 'filters.rows:', filters.value.rows)
    
    // Optional: Show success message when data is loaded
    // showSuccess('Dados Carregados', `${totalItems.value} registros encontrados`)
  } catch (error: any) {
    console.error('Erro ao carregar dados:', error)
    
    // Extract error message from different possible error structures
    let errorMessage = 'Erro desconhecido ao carregar os dados'
    let errorTitle = 'Erro na Requisição'
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data
      
      errorTitle = `Erro ${status}`
      
      if (typeof data === 'string') {
        errorMessage = data
      } else if (data?.message) {
        errorMessage = data.message
      } else if (data?.error) {
        errorMessage = data.error
      } else if (data?.title) {
        errorMessage = data.title
      } else {
        errorMessage = `Erro ${status}: ${error.response.statusText}`
      }
    } else if (error.request) {
      // Network error
      errorTitle = 'Erro de Conexão'
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
    } else {
      // Other error
      errorMessage = error.message || 'Erro desconhecido'
    }
    
    showError(errorTitle, errorMessage)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

function updateVisibleColumns(newVisibleColumns: any[]) {
  headers.value = newVisibleColumns;
  localStorage.setItem('odometer-table-headers', JSON.stringify(newVisibleColumns));
}

onMounted(() => {
  const savedHeaders = localStorage.getItem('odometer-table-headers');
  if (savedHeaders) {
    try {
      headers.value = JSON.parse(savedHeaders);
    } catch (e) {
      console.error('Failed to parse headers from localStorage', e);
      // Fallback to default headers if parsing fails
      headers.value = [
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
      ];
    }
  }
  fetchData(); // Fetch data after loading headers
})
</script>

<style scoped>
.odometer-table :deep(table) {
  border-collapse: collapse; /* Ensure borders touch */
}

/* Styles for both header and body cells */
.odometer-table :deep(th),
.odometer-table :deep(td) {
  border: 1px solid black !important; /* Black border */
  min-height: 0px !important; /* Explicitly remove minimum height */
  vertical-align: middle !important; /* Center content vertically */
  line-height: 1.1 !important; /* Reduced line height */
  height: 24px !important; /* Explicit height */
  white-space: nowrap !important; /* Prevent text wrapping */
}

/* Styles specifically for header cells */
.odometer-table :deep(thead th) {
  background-color: #e0e0e0; /* Fundo cinza claro */
  font-weight: bold !important; /* Texto em negrito - make sure it's applied */
  font-size: 0.7rem !important; /* Fonte menor */
}

/* Styles specifically for body cells */
.odometer-table :deep(tbody td) {
  font-size: 0.7rem !important; /* Fonte menor para células de dados */
}

/* Specific column widths to prevent wrapping */
.odometer-table :deep(th[role="columnheader"][aria-label*="Motorista"]),
.odometer-table :deep(td[data-label="driverName"]) {
  min-width: 150px !important; /* Example width for Motorista */
}

.odometer-table :deep(th[role="columnheader"][aria-label*="Processamento"]),
.odometer-table :deep(td[data-label="dateProcess"]) {
  min-width: 130px !important; /* Example width for Data de Processamento */
}

.odometer-table :deep(th[role="columnheader"][aria-label*="Veículo"]),
.odometer-table :deep(td[data-label="moving"]) {
  min-width: 100px !important; /* Example width for Status Veículo */
}

.pagination-select :deep(.v-field) {
  border: 1px solid black !important;
  border-radius: 0 !important;
  height: 24px !important;
  padding: 0 4px !important;
  box-shadow: none !important;
  background-color: white !important;
  min-width: 50px !important;
}

.pagination-select :deep(.v-select) {
  min-width: 50px !important;
}

/* Campo visível */
.pagination-select :deep(.v-field__input),
.pagination-select :deep(.v-field__field),
.pagination-select :deep(.v-select__selection-text) {
  font-size: 0.7rem !important;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

/* Ícone da seta */
.pagination-select :deep(.v-field__append-inner),
.pagination-select :deep(.v-icon) {
  padding: 0 !important;
  margin-left: 0 !important;
  height: 24px !important;
  font-size: 0.8rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Itens do menu dropdown */
.pagination-select :deep(.v-list-item),
.pagination-select :deep(.v-list-item--density-compact) {
  min-height: 20px !important;
  height: 20px !important;
  padding: 0 4px !important;
  font-size: 0.65rem !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

/* Título dos itens */
.pagination-select :deep(.v-list-item__title) {
  font-size: 0.65rem !important;
  line-height: 1 !important;
}

/* Container externo do menu dropdown */
.pagination-select :deep(.v-overlay__content) {
  padding: 0 !important;
  box-shadow: none !important;
  border: 1px solid black !important;
  border-radius: 0 !important;
  max-width: 60px !important;
}

/* Styles for the pagination footer buttons */
.odometer-table :deep(.v-pagination__list) {
  gap: 0 !important; /* Remove gap between buttons */
  display: flex !important; /* Enable flexbox */
  align-items: center !important; /* Vertically center items */
}

.odometer-table :deep(.v-pagination__item),
.odometer-table :deep(.v-pagination__navigation) {
  margin: 0 !important; /* Remove default margins */
  border-radius: 0 !important; /* Remove rounded corners */
  border: 1px solid black !important; /* Add black border */
  background-color: white !important; /* White background */
  color: black !important; /* Black text color */
  font-weight: normal !important; /* Not bold */
  min-width: 24px !important; /* Further reduce width */
  height: 24px !important; /* Match row height */
  padding: 0 2px !important; /* Adjust padding */
  font-size: 0.7rem !important; /* Smaller font */
  display: flex !important; /* Enable flexbox for centering content */
  align-items: center !important; /* Vertically center content */
  justify-content: center !important; /* Horizontally center content */
  vertical-align: middle !important; /* Attempt to vertically align */
}

.odometer-table :deep(.v-pagination__item .v-btn__content) { /* Target the text content inside the button */
  font-size: 0.7rem !important; /* Smaller font */
  font-weight: normal !important; /* Ensure not bold */
}

.odometer-table :deep(.v-pagination__item--is-active) {
    background-color: #e0e0e0 !important; /* Gray background for active */
    color: black !important;
    border-color: black !important;
}

.odometer-table :deep(.v-pagination__navigation--disabled) {
    opacity: 0.5 !important;
}

</style>