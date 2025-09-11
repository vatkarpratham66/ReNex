import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Donation from "./models/Donor.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected...");

    // Clear old data
    await User.deleteMany();
    await Donation.deleteMany();

    // Create sample users
    const donorPassword = await bcrypt.hash("donor123", 10);
    const ngoPassword = await bcrypt.hash("ngo123", 10);

    const donors = await User.create([
      {
        name: "Alice Donor",
        email: "alice@donor.com",
        phone: "9999999999",
        password: donorPassword,
        role: "donor",
      },
      {
        name: "Bob Donor",
        email: "bob@donor.com",
        phone: "8888888888",
        password: donorPassword,
        role: "donor",
      },
    ]);

    const ngos = await User.create([
      {
        name: "Helping Hands NGO",
        email: "help@ngo.com",
        phone: "7777777777",
        password: ngoPassword,
        role: "ngo",
        orgName: "Helping Hands",
        needsCategory: "food, clothes",
      },
      {
        name: "Bright Future NGO",
        email: "bright@ngo.com",
        phone: "6666666666",
        password: ngoPassword,
        role: "ngo",
        orgName: "Bright Future",
        needsCategory: "books, toys",
      },
    ]);

    // Create sample donations
    await Donation.create([
      {
        donor: donors[0]._id,
        title: "Rice Bags",
        description: "10kg rice bags for families",
        category: "food",
        quantity: 5,
        pickupLocation: "Mumbai",
        pickupBy: new Date(),
        urgent: true,
        status: "pending",
      },
      {
        donor: donors[1]._id,
        title: "Winter Clothes",
        description: "Jackets and sweaters",
        category: "clothes",
        quantity: 20,
        pickupLocation: "Pune",
        pickupBy: new Date(),
        urgent: false,
        status: "pending",
      },
    ]);

    console.log("✅ Demo data inserted!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
