// 🔥 TOP (IMPORTANT)
const params = new URLSearchParams(window.location.search);
const slot = params.get("slot");

if (!slot) {
  alert("No slot selected ❌");
  window.location.href = "index.html";
}


// 🔥 FUNCTION
function confirmBooking() {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const vehicle = document.getElementById("vehicle").value;

  const email = localStorage.getItem("userEmail");

  if (!email) {
    alert("Please login first ❌");
    window.location.href = "index.html";
    return;
  }

  if (!name || !phone || !vehicle) {
    alert("Please fill all details ❌");
    return;
  }

  fetch("http://localhost:3000/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ slot, name, phone, vehicle, email })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    window.location.href = "index.html";
  });
}

function goBack() {
  window.location.href = "index.html";
}