<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center" style="background: #e0e0e0;">
        <span style="font-size: 1.5rem; font-weight: bold;">Configuração</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-container>
          <!-- Seção de Colunas para adicionar -->
          <div class="text-subtitle-1">Colunas</div>
          <div class="d-flex align-center mb-4">
            <v-select
              label="Selecionar Coluna"
              :items="availableColumns"
              item-title="title"
              item-value="value"
              v-model="selectedColumnToAdd"
              variant="outlined"
              density="compact"
              hide-details
              class="mr-2"
            ></v-select>
            <v-btn icon size="small" @click="addColumn" :disabled="!selectedColumnToAdd">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <!-- Seção de Colunas Visíveis -->
          <div class="text-subtitle-1">Colunas Visíveis</div>
          <v-list dense>
            <v-list-item v-for="(header, index) in localVisibleColumns" :key="header.value">
              <v-list-item-content>
                <v-list-item-title>{{ header.title }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <div class="d-flex align-center">
                  <v-btn icon size="small" variant="text" @click="moveColumnDown(index)" :disabled="index === localVisibleColumns.length - 1">
                    <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                   <v-btn icon size="small" variant="text" @click="removeColumn(index)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                   <v-btn icon size="small" variant="text" @click="moveColumnUp(index)" :disabled="index === 0">
                    <v-icon>mdi-menu-up</v-icon>
                  </v-btn>
                </div>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="applyConfig">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  headers: { // Currently visible headers
    type: Array,
    default: () => []
  },
  allHeaders: { // All possible headers
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'apply-config'])

const dialog = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const localVisibleColumns = ref<any[]>([])
const selectedColumnToAdd = ref<any>(null)

const availableColumns = computed(() => {
  // Filter allHeaders to find those not in localVisibleColumns
  return props.allHeaders.filter(header => 
    !localVisibleColumns.value.some(visibleHeader => visibleHeader.value === (header as any).value)
  );
});

// Initialize local state when the modal opens, using the currently visible headers
watch(() => props.open, (isOpen) => {
  if (isOpen && props.headers) {
    localVisibleColumns.value = [...props.headers];
  }
});

function closeModal() {
  dialog.value = false
}

function addColumn() {
  if (selectedColumnToAdd.value) {
    const columnToAdd = props.allHeaders.find(header => (header as any).value === selectedColumnToAdd.value); // Find from allHeaders
    if (columnToAdd) {
      localVisibleColumns.value.push(columnToAdd);
      selectedColumnToAdd.value = null; // Clear selection
    }
  }
}

function removeColumn(index: number) {
  localVisibleColumns.value.splice(index, 1);
}

function moveColumnUp(index: number) {
  if (index > 0) {
    const column = localVisibleColumns.value[index];
    localVisibleColumns.value.splice(index, 1);
    localVisibleColumns.value.splice(index - 1, 0, column);
  }
}

function moveColumnDown(index: number) {
  if (index < localVisibleColumns.value.length - 1) {
    const column = localVisibleColumns.value[index];
    localVisibleColumns.value.splice(index, 1);
    localVisibleColumns.value.splice(index + 1, 0, column);
  }
}

function applyConfig() {
  emit('apply-config', localVisibleColumns.value);
  closeModal();
}

</script> 