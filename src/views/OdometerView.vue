<template>
  <v-container>
    <div class="d-flex align-center mb-4">
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

    <v-data-table
      :items="data"
      :headers="headers"
      :items-length="totalItems"
      v-model:options="tableOptions"
      :items-per-page="tableOptions.itemsPerPage"
      :loading="loading"
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
          <v-col cols="12" md="4">
            <div class="d-flex align-center justify-start">
              <span class="">Items per page:</span>
              <v-select
                v-model="tableOptions.itemsPerPage"
                :items="[10, 25, 50, 100]"
                density="compact"
                variant="outlined"
                hide-details
                class="ml-2"
                style="width: 80px;"
                @update:modelValue="newValue => {
                  console.log('Handler Select - novo valor recebido:', newValue);
                  tableOptions.itemsPerPage = newValue;
                  console.log('Handler Select - tableOptions.itemsPerPage após setar:', tableOptions.itemsPerPage);
                }"
              ></v-select>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center justify-center">
            <span class="">{{ totalItems === 0 ? '0-0 of 0' : `${(tableOptions.page - 1) * tableOptions.itemsPerPage + 1}-${Math.min(tableOptions.page * tableOptions.itemsPerPage, totalItems)} of ${totalItems}` }}</span>
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center justify-end">
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import FilterModal from '../components/FilterModal.vue'
import ColumnConfigModal from '../components/ColumnConfigModal.vue'
import { useFilters } from '../composables/useFilters'

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
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
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