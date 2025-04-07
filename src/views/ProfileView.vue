<template>
  <div class="profile-container">
    <div v-if="showNotification" :class="['notification', notificationType]">
      {{ notificationText }}
    </div>

    <div class="profile-wrapper">
      <div class="profile-card">
        <div class="profile-header">
          <h2>My Account</h2>
        </div>

        <div v-if="client" class="profile-content">
          <div class="profile-info-section">
            <div class="profile-avatar">
              <div class="avatar-circle">
                {{ client.username.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="profile-info">
              <div class="info-group">
                <label>Username</label>
                <p>{{ client.username }}</p>
              </div>
              <div class="info-group">
                <label>Email</label>
                <p>{{ client.email }}</p>
              </div>
            </div>
          </div>

          <div class="bookings-section">
            <h3>My Booking</h3>
            <div v-if="hasBooking" class="bookings-list">
              <div class="booking-item">
                <div class="booking-info">
                  <div class="booking-date">
                    {{
                      booking.timeSlot
                        ? formatDate(booking.timeSlot.date)
                        : "Date not specified"
                    }}
                  </div>
                  <div class="booking-time">
                    {{
                      booking.timeSlot
                        ? formatTime(booking.timeSlot.startTime) +
                          " - " +
                          formatTime(booking.timeSlot.endTime)
                        : "Time not specified"
                    }}
                  </div>
                </div>
                <button
                  @click="cancelBooking(booking.id)"
                  class="cancel-booking-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div v-else class="empty-bookings">
              <i class="fas fa-calendar-times"></i>
              <p>You don't have any bookings yet</p>
              <router-link to="/booking" class="book-time-btn">
                Book an Appointment
              </router-link>
            </div>
          </div>

          <button @click="logout" class="logout-button">Log Out</button>
        </div>
      </div>

      <div class="purchases-card">
        <div class="purchases-header">
          <h3>My Tests</h3>
          <span class="purchases-count">
            {{ client && client.productList ? client.productList.length : 0 }}
          </span>
        </div>

        <div
          v-if="client && client.productList && client.productList.length > 0"
          class="purchases-list"
        >
          <div
            v-for="product in client.productList"
            :key="product.id"
            class="purchase-item"
          >
            <h4>{{ product.name }}</h4>
            <span class="product-price">
              {{ Number(product.price).toFixed(2) }} €
            </span>
          </div>
        </div>

        <div
          v-if="client && client.productList && client.productList.length > 0"
          class="purchases-total"
        >
          <span class="total-label">Total:</span>
          <span class="total-amount">{{ calculateTotal }} €</span>
        </div>

        <div v-else class="empty-purchases">
          <i class="fas fa-shopping-cart"></i>
          <p>You don't have any purchased tests yet</p>
          <router-link to="/catalog" class="browse-catalog-btn">
            Browse Catalog
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const client = ref(null);
const booking = ref(null);
const showNotification = ref(false);
const notificationText = ref("");
const notificationType = ref("");

const router = useRouter();

const calculateTotal = computed(() => {
  if (
    !client.value ||
    !client.value.productList ||
    client.value.productList.length === 0
  )
    return "0.00";
  const total = client.value.productList.reduce(
    (sum, product) => sum + (parseFloat(product.price) || 0),
    0
  );
  return total.toFixed(2);
});

const hasBooking = computed(() => booking.value !== null);

const fetchUserProfile = async () => {
  try {
    const response = await axios.get("/api/auth/profile");
    client.value = response.data;
    if (client.value && client.value.id) {
      await fetchUserBooking(client.value.id);
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

const fetchUserBooking = async (clientId) => {
  try {
    const response = await axios.get(`/api/bookings/by-client/${clientId}`);
    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.id
    ) {
      booking.value = response.data;
    } else {
      booking.value = null;
    }
  } catch (error) {
    console.error("Error loading booking:", error);
    booking.value = null;
  }
};

const cancelBooking = async (bookingId) => {
  try {
    await axios.delete(`/api/bookings/${bookingId}`);
    showToast("Booking cancelled", "success");
    booking.value = null;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    showToast("Error cancelling booking", "error");
  }
};

const logout = () => {
  try {
    localStorage.removeItem("jwtToken");
    delete axios.defaults.headers.common["Authorization"];
    const internalInstance = getCurrentInstance();
    if (internalInstance?.appContext.config.globalProperties.updateAuthState) {
      internalInstance.appContext.config.globalProperties.updateAuthState();
    }
    router.push("/login");
  } catch (error) {
    console.error("Error during logout:", error);
    router.push("/login");
  }
};

const showToast = (text, type) => {
  notificationText.value = text;
  notificationType.value = type;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("en-US");
};

const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return "";
  return timeStr.substring(0, 5);
};

onMounted(() => {
  fetchUserProfile();
});
</script>
