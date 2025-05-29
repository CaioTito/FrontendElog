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

<script lang="ts" src="./OdometerView.script.ts"></script>
<style scoped src="./OdometerView.style.css"></style> 