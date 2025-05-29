<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center" style="background: #e0e0e0;">
        <div class="d-flex align-center">
          <v-icon color="black" class="mr-2">mdi-filter-variant</v-icon>
          <span style="font-size: 2rem; font-weight: bold;">Filtro</span>
        </div>
        <v-btn icon @click="closeModal" variant="text" color="black" style="background: #fff; border: 1px solid #ccc; box-shadow: 0 1px 4px #0001; display: flex; align-items: center; justify-content: center;">
          <v-icon color="black">mdi-close</v-icon>
          <span v-if="false" style="font-size: 1.5rem; color: black;">&#10005;</span>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="5">
            <v-text-field
              label="Data inicial"
              v-model="localFilters.startDate"
              type="date"
              density="compact"
            />
          </v-col>
          <v-col cols="2" class="d-flex align-center justify-center">
            Até
          </v-col>
          <v-col cols="5">
            <v-text-field
              label="Data final"
              v-model="localFilters.endDate"
              type="date"
              density="compact"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-combobox
              label="Frota"
              v-model="localFilters.idTms"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hint="Pressione Enter para adicionar múltiples frotas"
              persistent-hint
            ></v-combobox>
          </v-col>
          <v-col cols="6">
            <v-combobox
              label="Placa"
              v-model="localFilters.licensePlate"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hint="Pressione Enter para adicionar múltiples placas"
              persistent-hint
            ></v-combobox>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              label="Divisão"
              :items="divisions"
              item-value="id"
              item-title="label"
              v-model="localFilters.divisionId"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="black" @click="apply">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" src="./FilterModal.script.ts"></script>
<!-- Não há arquivo de estilo separado, pois o original não tinha estilos. -->
<!-- Se estilos forem adicionados, criar FilterModal.style.css e descomentar a linha abaixo -->
<!-- <style scoped src="./FilterModal.style.css"></style> --> 