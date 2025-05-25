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
              dense
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
              dense
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field label="Frota" v-model="localFilters.fleet" />
          </v-col>
          <v-col cols="6">
            <v-text-field label="Placa" v-model="localFilters.licensePlate" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              label="Divisão"
              :items="divisions"
              item-value="id"
              item-title="label"
              v-model="localFilters.division"
              dense
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

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps({
  open: Boolean,
  modelValue: Object
})

const emit = defineEmits(['update:open', 'apply'])

const dialog = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const localFilters = ref({
  startDate: '',
  endDate: '',
  fleet: '',
  licensePlate: '',
  division: '',
  ...props.modelValue
})

const divisions = [
  { id: 39, label: 'Citrosuco' },
  { id: 42, label: 'GLP' },
  { id: 45, label: 'Amônia' },
  { id: 46, label: 'Máquinas' },
  { id: 55, label: 'Ácido' },
  { id: 58, label: 'Treinamento' }
]

watch(() => props.modelValue, v => {
  localFilters.value = { ...localFilters.value, ...v }
})

function closeModal() {
  dialog.value = false
}

function apply() {
  emit('apply', localFilters.value)
  closeModal()
}
</script>
