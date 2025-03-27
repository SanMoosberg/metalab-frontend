import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";

import "@/assets/css/base.css";
import "@/assets/css/layout.css";
import "@/assets/css/home.css";
import "@/assets/css/catalog.css";
import "@/assets/css/auth.css";
import "@/assets/css/profile.css";
import "@/assets/css/about.css";
import "@/assets/css/contacts.css";
import "@/assets/css/booking.css";

axios.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith("/api")) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Vue.config.productionTip = false;

new Vue({
  router,
  data() {
    return {
      isAuthenticated: !!localStorage.getItem("jwtToken"),
    };
  },
  methods: {
    updateAuthState() {
      this.isAuthenticated = !!localStorage.getItem("jwtToken");
    },
  },
  render: (h) => h(App),
}).$mount("#app");
