const path = require("path");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const TOTAL_ROOMS = 20;
let guests = [];

// Allocate Room
function allocateRoom(checkIn) {

    const occupied = [];

    guests.forEach(g => {
        if (new Date(g.checkOut) > new Date(checkIn)) {
            occupied.push(g.room);
        }
    });

    let room = 1;

    while (occupied.includes(room)) {
        room++;
    }

    return room;
}

// Add Guest
app.post("/allocate", (req, res) => {

    const { name, checkIn, checkOut } = req.body;

    if (!name || !checkIn || !checkOut) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const room = allocateRoom(checkIn);

    const guest = {
        name,
        checkIn,
        checkOut,
        room
    };

    guests.push(guest);

    res.json({
        message: "Room Allocated",
        guest
    });

});

// Get Guests
app.get("/guests", (req, res) => {
    res.json(guests);
});

// Statistics
app.get("/statistics", (req, res) => {

    const roomsUsed = [...new Set(guests.map(g => g.room))].length;

    res.json({
        totalGuests: guests.length,
        roomsUsed: roomsUsed,
        availableRooms: TOTAL_ROOMS - roomsUsed
    });

});

// Reset
app.delete("/reset", (req, res) => {

    guests = [];

    res.json({
        message: "All records cleared"
    });

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});