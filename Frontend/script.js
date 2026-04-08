

function loadData() {
  fetch("http://localhost:3000/status")
    .then(res => res.json())
    .then(data => {

      let html = "";
      let emptyCount = 0;
      let total = 0;

      for (let key in data) {
        total++;

        let status = data[key]?.status || "empty";
        let user = data[key].user;
        let coupon = data[key].coupon;

        if (status === "empty") emptyCount++;

        html += `
<div class="glass ${status}">
  <h2>${key.toUpperCase()}</h2>
  <p>${status}</p>

  ${user ? `<small>👤 ${user}</small><br>` : ""}
  ${coupon ? `<small>🎟 ${coupon}</small><br>` : ""}

 ${status === "empty" 
  ? `<button class="btn btn-book" data-slot="${key}">
        ✔ Book Slot
     </button>` 
  : ""}

  <div>
   <button class="btn btn-enter" data-slot="${key}" data-type="enter">
      🚗 Enter
    </button>

    <button class="btn btn-exit" data-slot="${key}" data-type="exit">
      ⬅ Exit
    </button>
  </div>
</div>
`;
      }



     document.getElementById("slots").innerHTML = html;

// 🔥 buttons activate
document.querySelectorAll(".btn-book").forEach(btn => {
  btn.addEventListener("click", () => {
    const slot = btn.getAttribute("data-slot");
    bookSlot(slot);
  });
});

document.querySelectorAll(".btn-enter").forEach(btn => {
  btn.addEventListener("click", () => {
    const slot = btn.getAttribute("data-slot");
    setSensor(slot, true);
  });
});

document.querySelectorAll(".btn-exit").forEach(btn => {
  btn.addEventListener("click", () => {
    const slot = btn.getAttribute("data-slot");
    setSensor(slot, false);
  });
});

      document.getElementById("stats").innerHTML = `
  <div class="stat-card stat-total">📊 Total: ${total}</div>
  <div class="stat-card stat-empty">🟢 Empty: ${emptyCount}</div>
  <div class="stat-card stat-occupied">🔴 Occupied: ${total - emptyCount}</div>
`;

      updateChart(emptyCount, total - emptyCount);
    });
}





// Chart
let chart;

function updateChart(empty, occupied) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Empty", "Occupied"],
      datasets: [{
        data: [empty, occupied]
      }]
    }
  });
}

// Booking
function bookSlot(slot) {
  window.location.href = `booking.html?slot=${slot}`;
}

// Sensor simulation
function setSensor(slot, detected) {
  fetch("http://localhost:3000/sensor-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ slot, detected })
  })
  .then(res => res.text())
  .then(msg => {
    console.log(msg);
    loadData();
  });
}

// Auto refresh
// setInterval(loadData, 3000);


// Map
let map;
function initMap() {
  const parkingLocation = { lat: 28.6139, lng: 77.2090 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: parkingLocation,
  });

  // Parking marker
  new google.maps.Marker({
    position: parkingLocation,
    map: map,
    title: "Parking Area"
  });

  // 🔥 User location bhi yahi add karo
  navigator.geolocation.getCurrentPosition((position) => {
    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    new google.maps.Marker({
      position: userLocation,
      map: map,
      title: "You are here"
    });
  });
}


// window.onload = () => {
//   loadData();
//   initMap();
// };


function navigate() {
  const lat = 28.6139;
  const lng = 77.2090;

  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  );
}


function goHome() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("home").style.display = "block";
}

function enterApp() {

  if (localStorage.getItem("loggedIn") === "true") {

    document.getElementById("home").style.display = "none";
    document.getElementById("dashboard").style.display = "block";


    const name = localStorage.getItem("userName");
    document.getElementById("welcomeUser").innerText = "Welcome " + name + " 👋";

    loadData();
    loadMyBookings();

  } else {
    document.getElementById("authModal").style.display = "flex";
  }

 }




function logout() {
  localStorage.clear();
  window.location.reload();
}



window.addEventListener("load", () => {

  const isLoggedIn = localStorage.getItem("loggedIn");
  const params = new URLSearchParams(window.location.search);
  const openDashboard = params.get("dashboard");

  if (isLoggedIn === "true") {

    document.getElementById("home").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    const name = localStorage.getItem("userName");
    if (name) {
      document.getElementById("welcomeUser").innerText = "Welcome " + name + " 👋";
    }

    loadData();
    loadMyBookings();

  } else {


    document.getElementById("home").style.display = "block";
    document.getElementById("dashboard").style.display = "none";

  }

});


function loadMyBookings() {

  const email = localStorage.getItem("userEmail");

  fetch(`http://localhost:3000/my-bookings?email=${email}`)
    .then(res => res.json())
    .then(data => {

      console.log("My bookings:", data);
    });
}
function loadMyBookings() {

  const email = localStorage.getItem("userEmail");

  fetch(`http://localhost:3000/my-bookings?email=${email}`)
    .then(res => res.json())
    .then(data => {

      let html = "";

      if (data.length === 0) {
        html = "<p style='color:white;'>🚫 No bookings yet</p>";
      }

      data.forEach(item => {
        html += `
          <div class="booking-card">

            <div class="booking-header">
              <h3>🚗 ${item.slot.toUpperCase()}</h3>
              <span class="status-badge">Active</span>
            </div>

            <div class="booking-info">
              <p><strong>Vehicle:</strong> ${item.vehicle}</p>
              <p><strong>Time:</strong> ${item.time}</p>
            </div>

            <div class="booking-footer">
              <span class="coupon">🎟 ${item.coupon}</span>
              
            </div>

          </div>
        `;
      });

      document.getElementById("myBookings").innerHTML = html;
    });
}