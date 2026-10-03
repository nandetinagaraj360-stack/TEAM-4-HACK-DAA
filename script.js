// ========================================
// Hotel Room Allocation System
// Frontend JavaScript (Part 3A)
// ========================================

const API = "http://localhost:5000";

// Form Elements
const form = document.getElementById("guestForm");
const guestName = document.getElementById("guestName");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");

const tableBody = document.getElementById("guestTableBody");

const totalGuests = document.getElementById("totalGuests");
const roomsUsed = document.getElementById("roomsUsed");
const availableRooms = document.getElementById("availableRooms");

const alertBox = document.getElementById("alertBox");
const resetBtn = document.getElementById("resetBtn");

// ==========================
// Event Listeners
// ==========================

form.addEventListener("submit", function (e) {
    e.preventDefault();
    addGuest();
});

resetBtn.addEventListener("click", resetSystem);

// ==========================
// Add Guest
// ==========================

async function addGuest() {

    const name = guestName.value.trim();

    if (
        name === "" ||
        checkIn.value === "" ||
        checkOut.value === ""
    ) {
        showAlert("Please fill all fields.", "danger");
        return;
    }

    if (new Date(checkOut.value) <= new Date(checkIn.value)) {

        showAlert(
            "Check-out must be after Check-in.",
            "danger"
        );

        return;
    }

    try {

        const response = await fetch(API + "/allocate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name: name,

                checkIn: checkIn.value,

                checkOut: checkOut.value

            })

        });

        const data = await response.json();

        if (!response.ok) {

            showAlert(data.message, "danger");

            return;

        }

        showAlert(
            "Room allocated successfully!",
            "success"
        );

        form.reset();

        loadGuests();

        loadStatistics();

    }

    catch (error) {

        showAlert(
            "Cannot connect to server.",
            "danger"
        );

        console.log(error);

    }

}

// ==========================
// Load Guests
// ==========================

async function loadGuests() {

    try {

        const response = await fetch(API + "/guests");

        const guests = await response.json();

        tableBody.innerHTML = "";

        if (guests.length === 0) {

            tableBody.innerHTML = `

            <tr>

                <td colspan="5"
                    class="text-center text-muted">

                    No Guests Added Yet

                </td>

            </tr>

            `;

            return;

        }

        guests.forEach(guest => {

            let status = "";

            const now = new Date();

            const inDate = new Date(guest.checkIn);

            const outDate = new Date(guest.checkOut);

            if (now < inDate) {

                status =
                    `<span class="badge bg-warning">
                        Upcoming
                    </span>`;

            }

            else if (
                now >= inDate &&
                now <= outDate
            ) {

                status =
                    `<span class="badge bg-primary">
                        Checked In
                    </span>`;

            }

            else {

                status =
                    `<span class="badge bg-success">
                        Checked Out
                    </span>`;

            }

            tableBody.innerHTML += `

            <tr>

                <td>${guest.name}</td>

                <td>${formatDate(guest.checkIn)}</td>

                <td>${formatDate(guest.checkOut)}</td>

                <td>Room ${guest.room}</td>

                <td>${status}</td>

            </tr>

            `;

        });

    }

    catch (error) {

        showAlert(
            "Unable to load guests.",
            "danger"
        );

    }

}


// ==========================
// Load Statistics
// ==========================

async function loadStatistics() {

    try {

        const response = await fetch(API + "/statistics");

        const data = await response.json();

        totalGuests.innerText = data.totalGuests;
        roomsUsed.innerText = data.roomsUsed;
        availableRooms.innerText = data.availableRooms;

    }

    catch (error) {

        showAlert("Unable to load statistics.", "danger");

        console.log(error);

    }

}

// ==========================
// Reset System
// ==========================

async function resetSystem() {

    const confirmReset = confirm(
        "Are you sure you want to clear all guest records?"
    );

    if (!confirmReset) return;

    try {

        const response = await fetch(API + "/reset", {

            method: "DELETE"

        });

        const data = await response.json();

        showAlert(data.message, "success");

        form.reset();

        loadGuests();

        loadStatistics();

    }

    catch (error) {

        showAlert("Unable to reset the system.", "danger");

        console.log(error);

    }

}

// ==========================
// Show Bootstrap Alert
// ==========================

function showAlert(message, type) {

    alertBox.innerHTML = `

    <div class="alert alert-${type} alert-dismissible fade show">

        ${message}

        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert">
        </button>

    </div>

    `;

    setTimeout(() => {

        alertBox.innerHTML = "";

    }, 3000);

}

// ==========================
// Format Date
// ==========================

function formatDate(date) {

    return new Date(date).toLocaleString("en-IN", {

        year: "numeric",

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}

// ==========================
// Initial Page Load
// ==========================

window.onload = function () {

    loadGuests();

    loadStatistics();

};