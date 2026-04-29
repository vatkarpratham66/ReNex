const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/usersCloud"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/accept", require("./routes/accept"));
app.use("/api/stats", require("./routes/stats"));


// ✅ Admin routes (new)
app.use("/api/admin", require("./routes/adminCloud"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
