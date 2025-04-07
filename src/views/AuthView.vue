<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isLogin ? "Log In" : "Sign Up" }}</h2>
        <p class="auth-subtitle">
          {{
            isLogin
              ? "Sign in to your account to access services"
              : "Create an account to access services"
          }}
        </p>
      </div>

      <form @submit.prevent="isLogin ? login() : register()" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            required
            class="auth-input"
            placeholder="Enter username"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="auth-input"
            placeholder="Enter email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            class="auth-input"
            placeholder="Enter password"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            required
            class="auth-input"
            placeholder="Repeat password"
          />
        </div>

        <div class="auth-messages">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-message">
            {{ successMessage }}
          </p>
        </div>

        <button type="submit" class="auth-button">
          {{ isLogin ? "Sign In" : "Sign Up" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleForm">
            {{ isLogin ? "Sign Up" : "Sign In" }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "AuthView",
  setup() {
    const isLogin = ref(true);
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const router = useRouter();

    // Получаем глобальное свойство updateAuthState, установленное в main.js
    const { appContext } = getCurrentInstance();
    const updateAuthState = appContext.config.globalProperties.updateAuthState;

    const login = async () => {
      try {
        const response = await axios.post("/api/auth/login", {
          username: username.value,
          password: password.value,
        });
        if (response.status === 200) {
          const token = response.data.token;
          localStorage.setItem("jwtToken", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          updateAuthState();
          router.push("/profile");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          errorMessage.value = "Incorrect username or password";
        } else {
          errorMessage.value = "An error occurred while trying to log in.";
        }
      }
    };

    const register = async () => {
      if (password.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match";
        return;
      }
      try {
        await axios.post("/api/auth/register", {
          username: username.value,
          password: password.value,
          email: email.value,
        });
        successMessage.value = "Registration successful! You can now log in.";
        errorMessage.value = "";
        setTimeout(() => {
          isLogin.value = true;
        }, 2000);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          if (error.response.data && typeof error.response.data === "object") {
            errorMessage.value = Object.values(error.response.data).join(". ");
          } else {
            errorMessage.value = "Username already exists";
          }
        } else if (error.response && error.response.status === 400) {
          if (error.response.data && typeof error.response.data === "object") {
            errorMessage.value = Object.values(error.response.data).join(". ");
          } else {
            errorMessage.value = "Registration error. Please try again.";
          }
        } else {
          errorMessage.value =
            "An error occurred while trying to register. Please try again.";
        }
        successMessage.value = "";
      }
    };

    const toggleForm = () => {
      isLogin.value = !isLogin.value;
      errorMessage.value = "";
      successMessage.value = "";
    };

    return {
      isLogin,
      email,
      username,
      password,
      confirmPassword,
      errorMessage,
      successMessage,
      login,
      register,
      toggleForm,
    };
  },
};
</script>
