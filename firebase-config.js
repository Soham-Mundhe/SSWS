// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
// Optional: import analytics if needed
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAIdElTNeqNDZ81qBfPquRgIpzQadcik4U",
    authDomain: "ssws-628b0.firebaseapp.com",
    databaseURL: "https://ssws-628b0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ssws-628b0",
    storageBucket: "ssws-628b0.firebasestorage.app",
    messagingSenderId: "830954775948",
    appId: "1:830954775948:web:27d969a54759c8751422a9",
    measurementId: "G-7JLLF0TWQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { app, database };
