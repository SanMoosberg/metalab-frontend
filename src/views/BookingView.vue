<template>
  <div class="booking-container">
    <div v-if="showNotification" :class="['notification', notificationType]">
      {{ notificationText }}
    </div>

    <div class="week-navigation">
      <button @click="navigateWeek(-1)" class="nav-btn">
        <i class="fas fa-chevron-left"></i> Previous Week
      </button>
      <h2>
        {{ formatDayDate(weekDates[0]) }} - {{ formatDayDate(weekDates[6]) }}
      </h2>
      <button @click="navigateWeek(1)" class="nav-btn">
        Next Week <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div class="weekly-calendar">
      <div class="calendar-header">
        <div class="time-column"></div>
        <div
          v-for="date in weekDates"
          :key="date"
          :class="[
            'date-column',
            { today: isToday(date), 'past-date': isPastDate(date) },
          ]"
        >
          <div class="date-header">
            {{ formatDayDate(date) }}
            <button
              v-if="isAdmin && !isPastDate(date)"
              @click="generateSlots(date)"
              class="generate-slots-btn"
            >
              Generate Times
            </button>
          </div>
        </div>
      </div>

      <div class="calendar-body">
        <div v-for="time in timeIntervals" :key="time" class="time-row">
          <div class="time-label">{{ time }}</div>
          <div v-for="date in weekDates" :key="date" class="slot-cell">
            <div
              v-if="getSlotForTime(time, date)"
              :class="[
                'time-slot',
                {
                  free: getSlotForTime(time, date).status === 'FREE',
                  booked: getSlotForTime(time, date).status === 'BOOKED',
                  blocked:
                    getSlotForTime(time, date).status === 'ADMIN_BLOCKED',
                },
              ]"
            >
              <div class="slot-content">
                <span class="slot-time">{{ time }}</span>
                <div class="slot-actions" v-if="!isPastDate(date)">
                  <button
                    v-if="
                      isAdmin && getSlotForTime(time, date).status === 'FREE'
                    "
                    @click="blockSlot(getSlotForTime(time, date).id)"
                    class="block-btn"
                  >
                    Block
                  </button>
                  <button
                    v-else-if="
                      isAdmin &&
                      getSlotForTime(time, date).status === 'ADMIN_BLOCKED'
                    "
                    @click="unblockSlot(getSlotForTime(time, date).id)"
                    class="unblock-btn"
                  >
                    Unblock
                  </button>
                  <button
                    v-else-if="
                      getSlotForTime(time, date).status === 'FREE' &&
                      isAuthenticated
                    "
                    @click="bookSlot(getSlotForTime(time, date).id)"
                    class="book-btn"
                  >
                    Book
                  </button>
                  <button
                    v-else-if="
                      getSlotForTime(time, date).status === 'BOOKED' &&
                      canCancelBooking(getSlotForTime(time, date))
                    "
                    @click="
                      cancelBooking(bookings[getSlotForTime(time, date).id].id)
                    "
                    class="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const weekDates = ref([]);
const timeSlots = reactive({});
const bookings = reactive({});
const isAdmin = ref(false);
const isAuthenticated = ref(false);
const client = ref(null);
const showNotification = ref(false);
const notificationText = ref("");
const notificationType = ref("");
const timeIntervals = ref([]);

const router = useRouter();

const formatDate = (date) => date.toISOString().split("T")[0];

const setCurrentWeek = (date) => {
  const base = new Date(date);
  const mondayOffset = base.getDate() - base.getDay() + 1;
  weekDates.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(base);
    day.setDate(mondayOffset + i);
    return formatDate(day);
  });
  loadWeekSlots();
};

const loadWeekSlots = async () => {
  for (const key in bookings) {
    delete bookings[key];
  }
  for (const date of weekDates.value) {
    try {
      const response = await axios.get(`/api/slots`, { params: { date } });
      const slots = response.data;
      for (const slot of slots) {
        if (slot.status === "BOOKED") {
          try {
            const bookingResponse = await axios.get(`/api/bookings/${slot.id}`);
            bookings[slot.id] = bookingResponse.data;
          } catch (error) {
            console.error(`Error loading booking for ${slot.id}:`, error);
          }
        }
      }
      timeSlots[date] = slots;
    } catch (error) {
      console.error(`Error loading time slots for ${date}:`, error);
    }
  }
};

const generateSlots = async (date) => {
  try {
    await axios.post(`/api/slots/generate`, null, { params: { date } });
    const response = await axios.get(`/api/slots`, { params: { date } });
    timeSlots[date] = response.data;
    showToast("Slots generated successfully", "success");
  } catch (error) {
    console.error("Error generating slots:", error);
    showToast("Error generating slots", "error");
  }
};

const blockSlot = async (slotId) => {
  try {
    await axios.post(`/api/slots/${slotId}/block`);
    showToast("Slot blocked", "success");
    await loadWeekSlots();
  } catch (error) {
    console.error("Error blocking slot:", error);
    showToast("Error blocking slot", "error");
  }
};

const unblockSlot = async (slotId) => {
  try {
    await axios.post(`/api/slots/${slotId}/unblock`);
    showToast("Slot unblocked", "success");
    await loadWeekSlots();
  } catch (error) {
    console.error("Error unblocking slot:", error);
    showToast("Error unblocking slot", "error");
  }
};

const bookSlot = async (slotId) => {
  if (!isAuthenticated.value) {
    router.push("/login");
    return;
  }
  try {
    const response = await axios.post(`/api/bookings/book`, null, {
      params: {
        slotId,
        clientId: client.value.id,
      },
    });
    bookings[slotId] = response.data;
    showToast("Time booked successfully", "success");
    await loadWeekSlots();
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 409 || error.response.status === 400) &&
      typeof error.response.data === "string" &&
      error.response.data.includes("already has a booking")
    ) {
      showToast(
        "You already have a booking. Please cancel your existing booking first.",
        "error"
      );
      return;
    }
    showToast("Error during booking", "error");
  }
};

const cancelBooking = async (bookingId) => {
  try {
    await axios.delete(`/api/bookings/${bookingId}`);
    showToast("Booking cancelled", "success");
    await loadWeekSlots();
  } catch (error) {
    console.error("Error cancelling booking", error);
    showToast("Error cancelling booking", "error");
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

const getSlotForTime = (time, date) => {
  const slots = timeSlots[date] || [];
  return slots.find((slot) => slot.startTime.slice(0, 5) === time);
};

const navigateWeek = (direction) => {
  const firstDate = new Date(weekDates.value[0]);
  firstDate.setDate(firstDate.getDate() + direction * 7);
  setCurrentWeek(firstDate);
};

const formatDayDate = (dateStr) => {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]}, ${date.getDate()}`;
};

const isToday = (dateStr) => {
  const today = formatDate(new Date());
  return dateStr === today;
};

const isPastDate = (dateStr) => {
  const today = formatDate(new Date());
  return dateStr < today;
};

const canCancelBooking = (slot) => {
  if (!slot || slot.status !== "BOOKED" || !client.value) {
    return false;
  }
  const booking = bookings[slot.id];
  return booking ? booking.clientId === client.value.id : false;
};

onMounted(async () => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    isAuthenticated.value = true;
    try {
      const profileResponse = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      client.value = profileResponse.data;
      isAdmin.value = profileResponse.data.role === "ADMIN";
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }
  for (let hour = 8; hour < 18; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    timeIntervals.value.push(`${formattedHour}:00`, `${formattedHour}:30`);
  }
  setCurrentWeek(new Date());
});
</script>
