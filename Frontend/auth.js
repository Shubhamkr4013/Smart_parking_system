let isLogin = true;

// 🔁 TOGGLE LOGIN / REGISTER
function toggleAuth() {
  isLogin = !isLogin;

  document.getElementById("authTitle").innerText = isLogin ? "Login" : "Register";
  document.getElementById("authBtn").innerText = isLogin ? "Login" : "Register";

  document.getElementById("name").style.display = isLogin ? "none" : "block";

  document.getElementById("toggleText").innerHTML = isLogin
    ? `Don't have account? <span onclick="toggleAuth()">Register</span>`
    : `Already have account? <span onclick="toggleAuth()">Login</span>`;
}


// 🔐 HANDLE AUTH
function handleAuth() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password || (!isLogin && !name)) {
    alert("Fill all fields ❌");
    return;
  }

  const url = isLogin
    ? "http://localhost:3000/login"
    : "http://localhost:3000/register";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
.then(data => {

    // 🔴 REGISTER CASE
    if (!isLogin) {
  alert(data.message);

  if (data.message.includes("successful")) {
    toggleAuth(); // login pe switch
  }

  return;
}

    // 🔴 LOGIN CASE
    if (data.message === "Login successful") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userName", data.name);   
     localStorage.setItem("userEmail", data.email);


      document.getElementById("authModal").style.display = "none";

      document.getElementById("home").style.display = "none";
      document.getElementById("dashboard").style.display = "block";

      loadData();
    } else {
      alert(data.message);
    }

  });
}

function closeAuth() {
  document.getElementById("authModal").style.display = "none";
}