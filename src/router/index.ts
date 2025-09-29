import { createRouter, createWebHistory } from 'vue-router'
import kanban from '../views/kanban/index.vue';
import test from "../views/kanban/tes.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: kanban,
    },
    {
      path:"/test",
      name:"ComponentA",
      component:test
    }
  ]
})

export default router
