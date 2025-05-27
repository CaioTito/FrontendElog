<template>
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-card-title class="d-flex align-center" style="background: #e0e0e0;">
        <span style="font-size: 1.2rem; font-weight: bold;">Configuração</span>
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
          <div class="text-subtitle-1 mt-4">Colunas Visíveis</div>
          <v-list dense class="column-list">
            <v-list-item v-for="(header, index) in localVisibleColumns" :key="header.value" class="column-item">
              <v-list-item-title>{{ header.title }}</v-list-item-title>
              <template v-slot:append>
                <div class="d-flex align-center">
                  <v-btn icon size="x-small" variant="text" @click="moveColumnDown(index)" :disabled="index === localVisibleColumns.length - 1">
                    <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" @click="removeColumn(index)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" @click="moveColumnUp(index)" :disabled="index === 0">
                    <v-icon>mdi-menu-up</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-end pa-4">
        <v-btn color="black" @click="applyConfig" size="small">OK</v-btn>
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

<style scoped>
.v-card-title {
  padding: 12px 16px !important;
}

.v-card-text {
  padding: 16px !important;
}

.text-subtitle-1 {
    font-size: 1rem !important;
    font-weight: bold !important;
}

.v-select {
    font-size: 0.8rem !important;
    max-width: 220px !important;
}

.v-select :deep(.v-field) {
  box-shadow: none !important;
}

.v-select :deep(.v-field__field) {
  padding: 4px 10px !important;
  min-height: unset !important;
}

/* New rule for text inside the v-select box (placeholder/selected value) */
.v-select :deep(.v-field__input) {
  font-size: 0.75rem !important;
}

/* Additional rules to ensure font size is applied to all v-select text elements */
.v-select :deep(.v-field__input input) {
  font-size: 0.75rem !important;
}

.v-select :deep(.v-select__selection) {
  font-size: 0.75rem !important;
}

.v-select :deep(.v-field__input .v-field__field) {
  font-size: 0.75rem !important;
}

.v-select :deep(.v-field__overlay) {
  font-size: 0.75rem !important;
}

/* Force font size on the entire v-select component */
.v-select :deep(*) {
  font-size: 0.75rem !important;
}

.v-btn[size="x-small"] {
    min-width: 20px !important;
    height: 20px !important;
    padding: 0 !important;
}

.v-btn[size="x-small"] .v-icon {
    font-size: 1rem !important;
}

.column-list {
    padding: 0 !important;
    max-width: 264px !important;
}

.column-item {
    border: 1px solid black !important;
    margin-bottom: -1px;
    padding: 4px 12px !important;
    min-height: unset !important;
    font-weight: normal !important;
    background-color: white !important;
}

.column-item:hover, 
.column-item:focus, 
.column-item.v-list-item--active {
    font-weight: normal !important;
    background-color: white !important;
    color: inherit !important;
}

.column-item:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}

.column-item:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-bottom: 0;
}

.column-item :deep(.v-list-item-title) {
    font-size: 0.9rem !important;
    font-weight: normal !important;
}

/* New rule for items in the v-select dropdown list */
:deep(div[role="listbox"] .v-list-item-title) {
  font-size: 0.7rem !important;
}

.v-card-actions .v-btn {
    padding: 0 16px !important;
}

</style>

<!-- Unscoped styles to target v-select dropdown menu -->
<style>
/* Target the v-select dropdown menu items */
.v-overlay .v-list .v-list-item-title {
  font-size: 0.75rem !important;
}

/* Target all text in v-select dropdown */
.v-overlay .v-list-item {
  font-size: 0.75rem !important;
}

/* More specific targeting for v-select dropdown */
.v-menu .v-list .v-list-item-title {
  font-size: 0.75rem !important;
}

/* Target the entire dropdown content */
.v-menu .v-list-item {
  font-size: 0.75rem !important;
}
</style> 