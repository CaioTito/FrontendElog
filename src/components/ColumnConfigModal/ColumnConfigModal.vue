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

<script lang="ts" src="./ColumnConfigModal.script.ts"></script>
<style scoped src="./ColumnConfigModal.style.css"></style>

<!-- 
  Se os estilos globais para o v-select dropdown não funcionarem 
  quando importados de ColumnConfigModal.style.css devido ao escopo,
  eles podem precisar ser colocados aqui em uma tag <style> não escopada, por exemplo:
  <style>
    .v-overlay .v-list .v-list-item-title {
      font-size: 0.75rem !important;
    }
    /* ... outros estilos globais ... */
  </style>
--> 