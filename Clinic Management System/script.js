/// Import Firebase modules
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);



// DOM elements
const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const login = document.getElementById("login");
const receptionistDashboard = document.getElementById("receptionist-dashboard");
const doctorDashboard = document.getElementById("doctor-dashboard");
const addPatientButton = document.getElementById("add-patient");
const prescriptionDetails = document.getElementById("prescriptionDetails");
const logoutReceptionist = document.getElementById("logout-receptionist");
const logoutDoctor = document.getElementById("logout-doctor");
const generateBillButton = document.getElementById("generateBillButton");
const billDetails = document.getElementById("billDetails");
const clinicImage = document.getElementById("clinic")
// Login functionality



const fetchPrescriptions = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        prescriptionDetails.innerHTML = ""; // Clear existing content

        querySnapshot.forEach((doc) => {
            const patientData = doc.data();
            if (patientData.prescription) {
                const prescriptionDiv = document.createElement("div");
                prescriptionDiv.innerHTML = `
                    <p><strong>Token:</strong> ${patientData.token}</p>
                    <p><strong>Name:</strong> ${patientData.name}</p>
                    <p><strong>Prescription:</strong> ${patientData.prescription}</p>
                    <hr>
                `;
                prescriptionDetails.appendChild(prescriptionDiv);
            }
        });
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        alert("Failed to load prescriptions. Please try again later.");
    }
};

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth,email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (email === "receptionist@example.com") {
                receptionistDashboard.classList.remove("hidden");
                login.classList.add("hidden");
                clinicImage.classList.add("hidden");
                fetchPrescriptions();
            } else if (email === "doctor@example.com") {
                doctorDashboard.classList.remove("hidden");
                login.classList.add("hidden");
                clinicImage.classList.add("hidden");
                fetchPatients(); // Fetch patients for doctor
            }
            console.log(`Logged in as: ${user.email}`);
        })
        .catch((error) => {
            console.error("Error signing in:", error.code, error.message);
            alert(`Login failed: ${error.message}`);
        });
});

// Add new patient (Receptionist functionality)
addPatientButton.addEventListener("click", async () => {
    const patientName = prompt("Enter Patient Name:");
    const patientAge = prompt("Enter Patient Age:");
    const patientContact = prompt("Enter Patient Contact:");
    const token = Math.floor(Math.random() * 1000);

    if (patientName && patientAge && patientContact) {
        try {
            await addDoc(collection(db, "patients"), {
                name: patientName,
                age: parseInt(patientAge),
                contact: patientContact,
                token: token,
                prescription: ""
            });
            alert("Patient added successfully!");
        } catch (error) {
            alert(`Error adding patient: ${error.message}`);
        }
    }
});

// Fetch patients (Doctor functionality)
const fetchPatients = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const patientContainer = document.getElementById("patient-details");
        patientContainer.innerHTML = ''; // Clear previous patient details

        querySnapshot.forEach((doc) => {
            const patientData = doc.data();
            const patientDiv = document.createElement("div");
            patientDiv.classList.add('patient');

            patientDiv.innerHTML = `
                <p><strong>Token:</strong> ${patientData.token}</p>
                <p><strong>Name:</strong> ${patientData.name}</p>
                <p><strong>Age:</strong> ${patientData.age}</p>
                <textarea id="prescription-${doc.id}" class="prescription-input" placeholder="Write prescription here..."></textarea>
                <button id="add-prescription-${doc.id}" class="add-prescription-btn">Add Prescription</button>
                <button id="submit-prescription-${doc.id}" class="submit-prescription-btn" style="display:none;">Submit Prescription</button>
            `;

            // Attach event listeners for buttons
            const addPrescriptionButton = patientDiv.querySelector(`#add-prescription-${doc.id}`);
            const submitPrescriptionButton = patientDiv.querySelector(`#submit-prescription-${doc.id}`);
            const prescriptionTextArea = patientDiv.querySelector(`#prescription-${doc.id}`);

            addPrescriptionButton.addEventListener("click", () => showPrescriptionTextArea(prescriptionTextArea, submitPrescriptionButton));
            submitPrescriptionButton.addEventListener("click", () => submitPrescription(doc.id, prescriptionTextArea.value));

            patientContainer.appendChild(patientDiv);
        });
    } catch (error) {
        console.error("Error fetching patients:", error);
    }
};

// Show prescription text area and submit button
const showPrescriptionTextArea = (prescriptionTextArea, submitButton) => {
    prescriptionTextArea.style.display = "block";
    submitButton.style.display = "block"; // Show the submit button when "Add Prescription" is clicked
};

// Submit prescription function
const submitPrescription = async (patientId, prescriptionText) => {
    if (!prescriptionText) {
        alert("Please write a prescription.");
        return;
    }

    try {
        const patientRef = doc(db, "patients", patientId);
        await updateDoc(patientRef, {
            prescription: prescriptionText
        });
        alert("Prescription submitted successfully!");
        document.getElementById(`submit-prescription-${patientId}`).style.display = "none"; // Hide submit button
    } catch (error) {
        console.error("Error submitting prescription:", error);
    }
};


generateBillButton.addEventListener("click", async () => {
    const cost = document.getElementById("cost").value;

    if (!cost || cost <= 0) {
        alert("Please enter a valid cost.");
        return;
    }

    // Link bill to a prescription (you may ask the receptionist to select a token)
    const selectedToken = prompt("Enter the token of the patient for whom you are generating the bill:");

    try {
        // Save the bill in the database
        await addDoc(collection(db, "bills"), {
            token: selectedToken,
            cost: parseFloat(cost),
            createdAt: new Date()
        });

        // Display the generated bill
        const billHTML = `
            <div>
                <h3>Bill Details</h3>
                <p><strong>Token:</strong> ${selectedToken}</p>
                <p><strong>Cost:</strong> ₹${cost}</p>
            </div>
        `;
        billDetails.innerHTML = billHTML;

        alert("Bill generated successfully!");
    } catch (error) {
        console.error("Error generating bill:", error);
        alert("Failed to generate bill. Please try again.");
    }
});


// Logout functionality
const logout = () => {
    signOut(auth).then(() => {
        alert("Logged out successfully");
        location.reload();
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
};

logoutReceptionist.addEventListener("click", logout);
logoutDoctor.addEventListener("click", logout);
