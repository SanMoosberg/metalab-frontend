import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import CatalogView from "@/views/CatalogView.vue";
import BookingView from "@/views/BookingView.vue";
import ContactsView from "@/views/ContactsView.vue";
import AuthView from "@/views/AuthView.vue";
import ProfileView from "@/views/ProfileView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/about", component: AboutView },
  { path: "/catalog", component: CatalogView },
  { path: "/contacts", component: ContactsView },
  { path: "/login", component: AuthView },
  { path: "/profile", component: ProfileView },
  { path: "/booking", component: BookingView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
