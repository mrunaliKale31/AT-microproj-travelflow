import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Mock Data
const FLIGHTS = [
  { id: "f1", source: "New York", destination: "London", date: "2024-06-01", price: 450, Airline: "Global Air", duration: "7h 20m", departureTime: "10:00 AM" },
  { id: "f2", source: "New York", destination: "Paris", date: "2024-06-01", price: 520, Airline: "AeroExpress", duration: "7h 45m", departureTime: "11:30 PM" },
  { id: "f3", source: "San Francisco", destination: "Tokyo", date: "2024-06-05", price: 890, Airline: "Pacific Wings", duration: "11h 10m", departureTime: "08:15 AM" },
  { id: "f4", source: "London", destination: "Dubai", date: "2024-06-10", price: 380, Airline: "Royal Skies", duration: "7h 00m", departureTime: "02:00 PM" },
  { id: "f5", source: "Pune", destination: "Delhi", date: "2024-06-01", price: 120, Airline: "IndiSky", duration: "2h 10m", departureTime: "06:00 AM" },
  { id: "f6", source: "Mumbai", destination: "Delhi", date: "2024-06-01", price: 110, Airline: "Air Connect", duration: "2h 00m", departureTime: "08:00 AM" },
  { id: "f7", source: "Bangalore", destination: "Pune", date: "2024-06-01", price: 85, Airline: "JetSet", duration: "1h 30m", departureTime: "10:30 PM" },
];

const HOTELS = [
  { id: "h1", city: "London", name: "The Ritz London", price: 650, rating: 5, description: "Iconic luxury in the heart of Westminster.", image: "https://picsum.photos/seed/ritz/800/600" },
  { id: "h2", city: "Paris", name: "Hotel Lutetia", price: 580, rating: 5, description: "Art Deco elegance on the Left Bank.", image: "https://picsum.photos/seed/lutetia/800/600" },
  { id: "h3", city: "Tokyo", name: "Aman Tokyo", price: 920, rating: 5, description: "Sleek sanctuary overlooking the Imperial Palace.", image: "https://picsum.photos/seed/aman/800/600" },
  { id: "h4", city: "Dubai", name: "Burj Al Arab", price: 1200, rating: 5, description: "World's most luxurious sail-shaped hotel.", image: "https://picsum.photos/seed/burj/800/600" },
  { id: "h5", city: "Delhi", name: "The Taj Palace", price: 210, rating: 5, description: "Luxurious heritage stay in Chanakyapuri.", image: "https://picsum.photos/seed/taj/800/600" },
  { id: "h6", city: "Pune", name: "JW Marriott Pune", price: 180, rating: 5, description: "Contemporary luxury in the heart of the city.", image: "https://picsum.photos/seed/marriott/800/600" },
];

let BOOKINGS: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "wanderlust-secret-key";

  app.use(express.json());
  app.use(cors());

  // --- API Routes ---

  // Auth (Mock for now, will use Firebase in next steps)
  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    // In a real app, we'd save to DB. For now, simulate success.
    res.json({ message: "User registered successfully", userId: "user_" + Date.now() });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    // Simulate auth
    if (email === "test@example.com" && password === "password") {
      const token = jwt.sign({ email, userId: "test_user_123" }, JWT_SECRET);
      return res.json({ token, user: { name: "Test User", email } });
    }
    res.status(401).json({ error: "Invalid credentials" });
  });

  // Search
  app.get("/api/search-flights", (req, res) => {
    const { source, destination, date } = req.query;
    let results = FLIGHTS;
    if (source) results = results.filter(f => f.source.toLowerCase().includes((source as string).toLowerCase()));
    if (destination) results = results.filter(f => f.destination.toLowerCase().includes((destination as string).toLowerCase()));
    if (date) results = results.filter(f => f.date === date);
    res.json(results);
  });

  app.get("/api/search-hotels", (req, res) => {
    const { city } = req.query;
    let results = HOTELS;
    if (city) results = results.filter(h => h.city.toLowerCase().includes((city as string).toLowerCase()));
    res.json(results);
  });

  // Bookings & Payments
  app.get("/api/bookings", (req, res) => {
    res.json(BOOKINGS);
  });

  app.post("/api/book", (req, res) => {
    const { type, item, userId } = req.body;
    const newBooking = {
      id: "BK_" + Math.random().toString(36).substr(2, 9),
      type: type === 'flights' ? 'Flight' : 'Hotel',
      name: type === 'flights' ? `${item.source} to ${item.destination}` : item.name,
      date: type === 'flights' ? item.date : new Date().toLocaleDateString(),
      price: item.price,
      status: 'Confirmed'
    };
    BOOKINGS.push(newBooking);
    res.json({ message: "Booking confirmed", booking: newBooking });
  });

  app.delete("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    BOOKINGS = BOOKINGS.filter(b => b.id !== id);
    res.json({ message: "Booking cancelled" });
  });

  app.post("/api/payment", (req, res) => {
    const { cardNumber, amount } = req.body;
    // Simulate success/failure logic for testing
    if (cardNumber === "0000 0000 0000 0000") {
      return res.status(400).json({ status: "failure", error: "Insufficient funds" });
    }
    res.json({ status: "success", transactionId: "TX_" + Date.now() });
  });

  // --- Vite / Static Handling ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wanderlust Server running on http://localhost:${PORT}`);
  });
}

startServer();
