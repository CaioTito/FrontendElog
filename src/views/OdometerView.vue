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
      @apply="applyFilters"
    />

    <ColumnConfigModal
      :open="showConfigModal"
      @update:open="showConfigModal = $event"
      :headers="headers"
      :all-headers="allHeaders"
      @apply-config="updateVisibleColumns"
    />

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

        <template #item.odometerKm="{ item }">
          <span>{{ formatOdometer(item.odometerKm) }}</span>
        </template>

        <template #item.speed="{ item }">
          <span>{{ formatSpeed(item.speed) }}</span>
        </template>

        <template #item.driverName="{ item }">
          <span>{{ formatDriverName(item.driverName) }}</span>
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
                    tableOptions.itemsPerPage = newValue;
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
                  tableOptions.page = newPage;
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
import dayjs from 'dayjs'
import FilterModal from '../components/FilterModal.vue'
import ColumnConfigModal from '../components/ColumnConfigModal.vue'
import NotificationToast from '../components/NotificationToast.vue'
import { useFilters } from '../composables/useFilters'
import { useNotifications } from '../composables/useNotifications'
import { fetchOdometerData } from '../services/apiService'
import type { OdometerDataItem } from '../interfaces/response/odometerResponse'
import type { SimpleTableHeader, CurrentTableOptionsInitialization } from '../interfaces/uiTypes'

const { filters } = useFilters()
const { showError, showSuccess } = useNotifications()
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
    fetchData()
  }
})

watch(() => tableOptions.value.itemsPerPage, (newItemsPerPage, oldItemsPerPage) => {
  if (oldItemsPerPage !== undefined && newItemsPerPage !== oldItemsPerPage) {
    fetchData()
  }
})

async function fetchData(filtersRaw = filters.value) {
  if (isRequestInProgress.value) {
    return;
  }
  isRequestInProgress.value = true;
  loading.value = true;
  
  try {
    const params = {
      StartDate: filtersRaw.startDate,
      EndDate: filtersRaw.endDate,
      IdTms: filtersRaw.fleet,
      LicensePlate: filtersRaw.licensePlate,
      DivisionId: filtersRaw.division,
      Rows: tableOptions.value.itemsPerPage,
      Page: tableOptions.value.page
    };
    
    const responseData = await fetchOdometerData(params);
    
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

function applyFilters(newFilters: any) {
  filters.value = { ...filters.value, ...newFilters }
  
  tableOptions.value.page = 1
  
  fetchData()
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
        ALL_POSSIBLE_ODOMETER_COLUMNS.some(aph => aph.value === sh.value)
      );
      
      if (validSavedHeaders.length > 0) {
        headers.value = validSavedHeaders;
      } else {
        headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
      }
    } catch (e) {
      headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
    }
  } else {
    headers.value = [...ALL_POSSIBLE_ODOMETER_COLUMNS];
  }
  
  fetchData();
})
</script>

<style scoped>
.odometer-table :deep(table) {
  border-collapse: collapse;
}

.odometer-table :deep(th),
.odometer-table :deep(td) {
  border: 1px solid black !important;
  min-height: 0px !important;
  vertical-align: middle !important;
  line-height: 1.1 !important;
  height: 24px !important;
  white-space: nowrap !important;
}

.odometer-table :deep(thead th) {
  background-color: #e0e0e0;
  font-weight: bold !important;
  font-size: 0.7rem !important;
}

.odometer-table :deep(tbody td) {
  font-size: 0.7rem !important;
}

.odometer-table :deep(th[role="columnheader"][aria-label*="Motorista"]),
.odometer-table :deep(td[data-label="driverName"]) {
  min-width: 150px !important;
}

.odometer-table :deep(th[role="columnheader"][aria-label*="Processamento"]),
.odometer-table :deep(td[data-label="dateProcess"]) {
  min-width: 130px !important;
}

.odometer-table :deep(th[role="columnheader"][aria-label*="Veículo"]),
.odometer-table :deep(td[data-label="moving"]) {
  min-width: 100px !important;
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

.pagination-select :deep(.v-list-item__title) {
  font-size: 0.65rem !important;
  line-height: 1 !important;
}

.pagination-select :deep(.v-overlay__content) {
  padding: 0 !important;
  box-shadow: none !important;
  border: 1px solid black !important;
  border-radius: 0 !important;
  max-width: 60px !important;
}

.odometer-table :deep(.v-pagination__list) {
  gap: 0 !important;
  display: flex !important;
  align-items: center !important;
}

.odometer-table :deep(.v-pagination__item),
.odometer-table :deep(.v-pagination__navigation) {
  margin: 0 !important;
  border-radius: 0 !important;
  border: 1px solid black !important;
  background-color: white !important;
  color: black !important;
  font-weight: normal !important;
  min-width: 24px !important;
  height: 24px !important;
  padding: 0 2px !important;
  font-size: 0.7rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
}

.odometer-table :deep(.v-pagination__item .v-btn__content) {
  font-size: 0.7rem !important;
  font-weight: normal !important;
}

.odometer-table :deep(.v-pagination__item--is-active) {
    background-color: #e0e0e0 !important;
    color: black !important;
    border-color: black !important;
}

.odometer-table :deep(.v-pagination__navigation--disabled) {
    opacity: 0.5 !important;
}

</style>