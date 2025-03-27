<template>
  <div id="app">
    <header>
      <div class="logo">
        <router-link to="/">
          <h1>MetaLaboratory</h1>
        </router-link>
      </div>
      <nav>
        <ul>
          <li><router-link to="/about">About</router-link></li>
          <li><router-link to="/catalog">Tests</router-link></li>
          <li><router-link to="/booking">Booking</router-link></li>
          <li><router-link to="/contacts">Contact</router-link></li>
          <li>
            <router-link v-if="!$root.isAuthenticated" to="/login"
              >Login</router-link
            >
            <router-link v-else to="/profile">My Account</router-link>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <div class="footer-container">
        <div class="footer-section">
          <h3>MetaLaboratory</h3>
          <p>Advanced laboratory diagnostics for your health and well-being.</p>
          <p>Opening Hours:</p>
          <p>Mon-Fri: 8:00 - 20:00</p>
          <p>Sat: 9:00 - 18:00</p>
          <p>Sun: 9:00 - 16:00</p>
        </div>

        <div class="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/about">About Us</router-link></li>
            <li><router-link to="/catalog">Available Tests</router-link></li>
            <li>
              <router-link to="/booking">Book an Appointment</router-link>
            </li>
            <li><router-link to="/contacts">Contact Us</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>Contact</h3>
          <p>
            <i class="fas fa-map-marker-alt"></i> Arhitekti tn 10, 50407 Tartu,
            Estonia
          </p>
          <p><i class="fas fa-phone"></i> +372 512 3456</p>
          <p><i class="fas fa-envelope"></i> info@metalab.ee</p>
          <p class="copyright">
            <i class="fas fa-copyright"></i>
            2024 MetaLaboratory. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
