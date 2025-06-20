const express = require("express");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true,
}));

const USERS_FILE = "./users.json";
app.use(express.static("public"));

// Register user
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ msg: "User already exists" });
  }
  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.json({ msg: "Registered successfully" });
});

// Login user
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ msg: "Invalid credentials" });

  req.session.user = user;
  res.json({ msg: "Login successful" });
});

// Protected route
app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/index.html");
  res.sendFile(path.join(__dirname, "public/home.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/index.html");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
