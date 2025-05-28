import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import OdometerView from '../views/OdometerView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Odometer',
    component: OdometerView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router