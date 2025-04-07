<template>
  <div class="catalog-container">
    <div v-if="showNotification" :class="['notification', notificationType]">
      {{ notificationText }}
    </div>

    <div v-if="isAdmin" class="admin-panel">
      <h2>Admin Panel</h2>
      <div class="add-product-form">
        <input v-model="newProduct.name" placeholder="Test name" />
        <textarea
          v-model="newProduct.description"
          placeholder="Description"
        ></textarea>
        <input
          v-model="newProduct.price"
          type="number"
          step="0.01"
          placeholder="Price"
        />

        <button @click="addOrEditProduct" class="admin-button">
          {{ isEditing ? "Update Test" : "Add Test" }}
        </button>

        <button v-if="isEditing" @click="cancelEditing" class="cancel-button">
          Cancel
        </button>
      </div>
    </div>

    <div class="analysis-grid">
      <div v-for="product in products" :key="product.id" class="analysis-item">
        <div
          class="product-status"
          :class="{
            show: isProductPurchased(product.id),
            purchased: isProductPurchased(product.id),
          }"
        >
          {{ isProductPurchased(product.id) ? "Purchased" : "" }}
        </div>
        <div class="analysis-content">
          <div class="analysis-info">
            <h2>{{ product.name }}</h2>
            <p>{{ product.description }}</p>
          </div>
          <div class="analysis-footer">
            <span class="price">{{ Number(product.price).toFixed(2) }} €</span>
            <div class="analysis-actions">
              <div v-if="isAuthenticated" class="action-buttons">
                <button
                  class="buy-button"
                  title="Add test"
                  @click="buyProduct(client.id, product.id)"
                ></button>
                <button
                  class="remove-button"
                  title="Remove test"
                  @click="removeOrder(client.id, product.id)"
                ></button>
              </div>
              <div v-if="isAdmin" class="admin-actions">
                <button class="edit-button" @click="startEditing(product)">
                  Edit
                </button>
                <button
                  class="delete-button"
                  @click="deleteProduct(product.id)"
                >
                  Delete
                </button>
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
import axios from "axios";

const client = ref(null);
const products = ref([]);
const isAdmin = ref(false);
const isAuthenticated = ref(false);
const isEditing = ref(false);
const newProduct = reactive({
  id: null,
  name: "",
  description: "",
  price: 0,
});
const showNotification = ref(false);
const notificationText = ref("");
const notificationType = ref("");

const showToast = (text, type) => {
  notificationText.value = text;
  notificationType.value = type;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const profileResponse = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      client.value = profileResponse.data;
      isAdmin.value = profileResponse.data.role === "ADMIN";
      isAuthenticated.value = true;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

const loadProducts = async () => {
  try {
    const response = await axios.get("/api/products");
    products.value = response.data;
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

const addOrEditProduct = async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    if (isEditing.value) {
      await axios.patch(`/api/products/${newProduct.id}`, newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post("/api/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    newProduct.id = null;
    newProduct.name = "";
    newProduct.description = "";
    newProduct.price = 0;
    isEditing.value = false;
    await loadProducts();
  } catch (error) {
    alert("Error: " + (error.response?.data?.message || error));
  }
};

const startEditing = (product) => {
  newProduct.id = product.id;
  newProduct.name = product.name;
  newProduct.description = product.description;
  newProduct.price = product.price;
  isEditing.value = true;
};

const cancelEditing = () => {
  newProduct.id = null;
  newProduct.name = "";
  newProduct.description = "";
  newProduct.price = 0;
  isEditing.value = false;
};

const deleteProduct = async (id) => {
  if (confirm("Are you sure you want to delete this test?")) {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProducts();
    } catch (error) {
      alert("Error deleting test: " + (error.response?.data?.message || error));
    }
  }
};

const isProductPurchased = (productId) => {
  return client.value?.productList?.some((p) => p.id === productId) || false;
};

const buyProduct = async (clientId, productId) => {
  if (isProductPurchased(productId)) {
    showToast("This test is already purchased", "error");
    return;
  }
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await axios.post(
      `/api/clients/${clientId}/${productId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.status >= 200 && response.status < 300) {
      showToast("✓ Test added to cart", "success");
    } else {
      showToast("✗ Error adding test (unexpected status)", "error");
    }
    await fetchUserProfile();
  } catch (error) {
    console.error("Error adding test:", error);
    showToast("✗ Error adding test", "error");
  }
};

const removeOrder = async (clientId, productId) => {
  try {
    const token = localStorage.getItem("jwtToken");
    await axios.delete(`/api/clients/${clientId}/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast("✓ Test removed from cart", "success");
    await fetchUserProfile();
  } catch (error) {
    console.error("Error removing test:", error);
    showToast("✗ Error removing test", "error");
  }
};

onMounted(async () => {
  await loadProducts();
  await fetchUserProfile();
});
</script>
