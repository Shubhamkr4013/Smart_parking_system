const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app); 
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Database/User");
const Booking = require("./Database/Booking");
const path = require("path");
require("dotenv").config();

// 🔥 frontend serve karo
app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// initial data
let parkingData = {
  slot1: { status: "empty", user: null, phone: null, vehicle: null, time: null, coupon: null },
  slot2: { status: "empty", user: null, phone: null, vehicle: null, time: null, coupon: null },
  slot3: { status: "empty", user: null, phone: null, vehicle: null, time: null, coupon: null }
};


// let history = [];


// 🔥 realtime update function
function updateClients() {
  io.emit("parkingData", parkingData);
}

// 🔥 Booking API
app.post("/book", async (req, res) => {
  const { slot, name, phone, vehicle, email } = req.body;

  if (parkingData[slot].status === "empty") {

    const time = new Date().toLocaleString();
    const coupon = generateCoupon();

    parkingData[slot] = {
      status: "reserved",
      user: name,
      phone,
      vehicle,
      time,
      coupon
    };

    // 📩 SMS
    sendSMS(phone, name, slot, time, coupon);

    // 📊 History save
    const newBooking = new Booking({
  slot,
  name,
  email,
  phone,
  vehicle,
  time,
  coupon
});

await newBooking.save();

    // 🔥 realtime update
    updateClients();

    res.send(`Booking Confirmed 🎉 Coupon: ${coupon}`);

  } else {
    res.send("Slot not available");
  }
});



// app.get("/history", (req, res) => {
//   res.json(history);
// });


// API for frontend
app.get("/status", (req, res) => {

  for (let key in parkingData) {
    if (!parkingData[key].status) {
      parkingData[key].status = "empty";
    }
  }

  res.json(parkingData);
});

// sensor update
app.post("/sensor-update", (req, res) => {
  const { slot, detected } = req.body;

  if (detected) {
    parkingData[slot].status = "occupied";
  } else {
    parkingData[slot] = {
      status: "empty",
      user: null,
      phone: null,
      vehicle: null,
      time: null,
      coupon: null
    };
  }

  updateClients();
  res.send("Sensor updated");
});

// socket connection
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.emit("parkingData", parkingData); // initial data
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running");
});

// generateCoupon
function generateCoupon() {
  return "PKG-" + Math.floor(1000 + Math.random() * 9000);
}

function sendSMS(phone, name, slot, time, coupon) {
  console.log(`
🚗 Booking Confirmed
Name: ${name}
Slot: ${slot}
Time: ${time}
Coupon: ${coupon}
Phone: ${phone}
`);
}


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.json({
  message: "User already exists"
});
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword
  });

  await newUser.save();

  res.json({
  message: "Register successful"
  });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
  message: "User not found"
});
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({
  message: "Wrong password"
});
  }

  res.json({
  message: "Login successful",
  name: user.name, 
  email: user.email
});
});

app.get("/my-bookings", async (req, res) => {

  const { email } = req.query;

  const userBookings = await Booking.find({ email });
res.json(userBookings);
});