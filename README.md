# METALAB FRONTEND

**MetaLab Frontend** is a Vue.js (Node.js + Vue CLI) application for managing diagnostic laboratory services, including booking time slots, user registration, and product management.

## KEY FEATURES

- **User Authentication & Registration**  
  Secure login with local token storage.
- **Appointment Booking**  
  Weekly calendar for booking, canceling, and (admin) blocking time slots.
- **Test Product Catalog**  
  Basic CRUD for lab tests (add, edit, delete) with purchase/removal options for users.
- **Admin Panel**  
  Generate and block/unblock slots, plus manage product data.
- **User Dashboard**  
  Track bookings, purchased tests, and account details in one place.

## PREREQUISITES

- **Node.js:** 14+  
- **npm** (or **Yarn**)  
- **Vue CLI:** 4+  

## CONFIGURATION

Update the backend API endpoints (in axios calls) to match your server’s configuration.

## BUILD & RUN

1. **Install Dependencies**  
   ```bash
   npm install
2. **Run in Development**  
   ```bash
   npm run serve
3. **Build for Production**  
   ```bash
   npm run build
4. **Deployment**
   
   Deploy the contents of the dist directory to your production server.


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
