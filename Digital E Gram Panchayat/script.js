
// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut  } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

const adminDashboard = document.getElementById("admin-dashboard");
const userDashboard = document.getElementById("user-dashboard");
const staffDashboard = document.getElementById("staff-dashboard");
const logoutAdmin = document.getElementById("logout-admin");
const logoutStaff = document.getElementById("logout-staff");
const logoutUser = document.getElementById("logout-user");
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const login = document.getElementById("login");

// Handle login form submission
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth,email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          if (email === "admin@example.com") {
              adminDashboard.classList.remove("hidden");
              login.style.display="none";
          } else if (email === "user@example.com") {
              userDashboard.classList.remove("hidden");
              login.style.display="none";
          } else if (email=== "staff@example.com")
          {
            staffDashboard.classList.remove("hidden");
            login.style.display="none";
          }
          console.log(`Logged in as: ${user.email}`);
      })
      .catch((error) => {
          alert(`Login failed: ${error.message}`);
      });
});

//Logout Functionality
const logout = () => {
  signOut(auth).then(() => {
      alert("Logged out successfully");
      location.reload();
  }).catch((error) => {
      console.error("Error logging out:", error);
  });
};

//Admin Create User Functionality

document.getElementById("add-service").addEventListener("click", () => {
  document.getElementById("serviceFormContainer").style.display = "block";
  console.log("Button was clicked")
});

export const createService = async () => {
  const serviceId = "service_"+Math.floor(100 + Math.random() * 900);
  const name = document.getElementById("serviceName").value;
  const description = document.getElementById("serviceDescription").value;
  const category = document.getElementById("serviceCategory").value;
  const eligibility = document.getElementById("serviceEligibility").value;
  const processingTime = document.getElementById("serviceProcessingTime").value;
  const fee = parseFloat(document.getElementById("serviceFee").value) || 0;
  const documentsRequired = document.getElementById("serviceDocuments").value.split(",").map(doc => doc.trim());
  
  try {
      const docRef = await addDoc(collection(db, "services"), {
          serviceId,
          name,
          description,
          category,
          eligibility,
          processingTime,
          fee,
          documentsRequired,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "active"
      });
      alert("Service Created Successfully! ID: " + serviceId);
      document.getElementById("serviceForm").reset();
  } catch (error) {
      console.error("Error adding service: ", error);
  }
};
document.getElementById("submitService").addEventListener("click",createService)

//Admin Delete Service

document.getElementById("delete-service").addEventListener("click", () => {
  document.getElementById("deleteServiceContainer").style.display = "block";
});

async function findAndDeleteService() {
  const serviceId = document.getElementById("serviceIdInput").value.trim();

  if (!serviceId) {
      alert("Please enter a valid Service ID.");
      return;
  }

  try {
      const servicesRef = collection(db, "services"); 
      console.log("Firestore Collection Reference:", servicesRef); // Debugging

      const q = query(servicesRef, where("serviceId", "==", serviceId)); 
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          alert("❌ Service ID not found in Firestore!");
          return;
      }

      let docId = null;
      querySnapshot.forEach((docSnapshot) => {
          console.log("Service Found:", docSnapshot.data()); // Log for debugging
          docId = docSnapshot.id; 
      });

      // Confirm before deleting
      if (!confirm(`Are you sure you want to delete service ID: ${serviceId}?`)) return;

      await deleteDoc(doc(db, "services", docId));
      alert(`✅ Service deleted successfully!`);
      document.getElementById("serviceIdInput").value = ""

  } catch (error) {
      console.error("❌ Error deleting service:", error);
      alert("⚠️ Failed to delete service. Check console for errors.");
  }
}

document.getElementById("deleteServiceBtn").addEventListener("click",findAndDeleteService)


//Admin Update Service Functionality

document.getElementById("update-service").addEventListener("click", () => {
  document.getElementById("updateServiceContainer").style.display = "block";
});

async function findAndUpdateService() {
    const serviceId = document.getElementById("updateServiceIdInput").value.trim();
    if (!serviceId) {
        alert("⚠️ Please enter a valid Service ID.");
        return;
    }

    try {
        const servicesRef = collection(db, "services");
        console.log("🔍 Searching for serviceId:", serviceId); // Debugging

        // Query to find the document where serviceId matches
        const q = query(servicesRef, where("serviceId", "==", serviceId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Service ID not found in Firestore! Check console for stored IDs.");
            return;
        }

        let docId = null;
        let existingData = null;
        querySnapshot.forEach((docSnapshot) => {
            console.log("✅ Service Found:", docSnapshot.data());
            docId = docSnapshot.id;
            existingData = docSnapshot.data();
        });

        // Get new values from input fields (use existing values if left empty)
        const newName = document.getElementById("updateServiceName").value.trim() || existingData.name;
        const newDescription = document.getElementById("updateServiceDescription").value.trim() || existingData.description;
        const newCategory = document.getElementById("updateServiceCategory").value.trim() || existingData.category;
        const newEligibility = document.getElementById("updateServiceEligibility").value.trim() || existingData.eligibility;
        const newProcessingTime = document.getElementById("updateServiceProcessingTime").value.trim() || existingData.processingTime;
        const newFee = parseFloat(document.getElementById("updateServiceFee").value) || existingData.fee;
        const newDocumentsRequired = document.getElementById("updateServiceDocuments").value.trim() 
            ? document.getElementById("updateServiceDocuments").value.split(",").map(doc => doc.trim()) 
            : existingData.documentsRequired;

        if (!confirm(`Are you sure you want to update service ID: ${serviceId}?`)) return;

        // Update the document
        await updateDoc(doc(db, "services", docId), {
            name: newName,
            description: newDescription,
            category: newCategory,
            eligibility: newEligibility,
            processingTime: newProcessingTime,
            fee: newFee,
            documentsRequired: newDocumentsRequired,
            updatedAt: new Date().toISOString()
        });

        alert(`✅ Service updated successfully!`);

    } catch (error) {
        console.error("❌ Error updating service:", error);
        alert("⚠️ Failed to update service. Check console for errors.");
    }
}

document.getElementById("updateServiceBtn").addEventListener("click",findAndUpdateService)

//Registering User

document.getElementById("register-user").addEventListener("click", async () => {
    // Collect user data
    const name = prompt("Enter your full name:");
    const email = prompt("Enter your email address:");
    const contactNumber = prompt("Enter your contact number:");
    const address = prompt("Enter your address:");

    // Generate a random userId
    const userId = "user_"+Math.floor(100 + Math.random() * 900);

    // Current timestamp
    const timestamp = new Date().toISOString();

    // Prepare user data
    const userData = {
        userId,
        name,
        email,
        contactNumber,
        address,
        registrationStatus: "pending", // Initial registration status
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    try {
        // Add user data to Firestore "users" collection
        const usersCollection = collection(db, "users");
        const docRef = await addDoc(usersCollection, userData);
        // Successfully registered
        alert(`Registration successful! User ID: ${userId}`);
        console.log("User registered with ID: ", docRef.id);

        // Optionally, clear the input fields or close the registration form
        // document.getElementById("user-dashboard").classList.add("hidden");

    } catch (error) {
        console.error("Error registering user: ", error);
        alert("Registration failed. Please try again later.");
    }
});

//User Apply Services

document.getElementById('apply-service').addEventListener('click', function() {
    document.getElementById('applyServiceContainer').style.display = 'block';
    document.getElementById('application-status-container').style.display = 'none';
  });

  // Handle service application submission
  document.getElementById('service-application-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const serviceId = document.getElementById('serviceId').value;
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;

    try {
      // Assume Firestore setup is done and db is the Firestore instance
      const db = getFirestore();
      const applicationRef = collection(db, 'userApplications');

      // Add application to Firestore
      await addDoc(applicationRef, {
        serviceId,
        userName,
        userEmail,
        status: 'Pending', // Status can be 'Pending', 'Approved', or 'Rejected'
        appliedAt: new Date().toISOString()
      });

      // Show application status
      document.getElementById('applyServiceContainer').style.display = 'none';
      document.getElementById('application-status-container').style.display = 'block';
      document.getElementById('application-status-message').innerHTML = 'Your application is submitted successfully! Status: Pending';

    } catch (error) {
      console.error("Error applying for service: ", error);
      document.getElementById('application-status-message').innerHTML = 'There was an error submitting your application. Please try again.';
    }
  });

  //Staff View Services
  // Function to view services
  
document.getElementById("view-services").addEventListener("click", async () => {
    const servicesRef = collection(db, "services");
    const querySnapshot = await getDocs(servicesRef);

    const servicesListDiv = document.getElementById('servicesList');
    servicesListDiv.innerHTML = ''; // Clear previous list
    
    // Check if any services exist
    if (querySnapshot.empty) {
        servicesListDiv.innerHTML = "<p>No services available.</p>";
    } else {
        querySnapshot.forEach((doc) => {
            const service = doc.data();
            const serviceDiv = document.createElement("div");
            serviceDiv.innerHTML = `
                <p><strong>Service Name:</strong> ${service.name}</p>
                <p><strong>Category:</strong> ${service.category}</p>
                <p><strong>Status:</strong> ${service.status}</p>
            `;
            servicesListDiv.appendChild(serviceDiv);
        });
    }
});

//Staff Update Application Status

async function updateServiceStatus(serviceId) {
    const newStatus = prompt("Enter new status for the service (e.g., Approved, Rejected, Pending):");

    if (!newStatus) {
        alert("Status cannot be empty.");
        return;
    }

    try {
        const servicesRef = collection(db, "services");

        // Query Firestore for the document where 'serviceId' field matches input serviceId
        const q = query(servicesRef, where("serviceId", "==", serviceId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("No service found with this ID.");
            return;
        }

        // Get the first document found (assuming serviceId is unique)
        const serviceDoc = querySnapshot.docs[0];
        const serviceRef = doc(db, "services", serviceDoc.id);

        // Update the document with the new status
        await updateDoc(serviceRef, {
            status: newStatus,
            updatedAt: new Date().toISOString(),
        });

        alert("Service status updated successfully!");

    } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status. Please try again.");
    }
}

// Event listener for the "Update Application Status" button
document.getElementById("update-status").addEventListener("click", async () => {
    const serviceId = prompt("Enter Service ID to update status:");
    
    if (serviceId) {
        await updateServiceStatus(serviceId);
    } else {
        alert("Service ID cannot be empty.");
    }
});




logoutAdmin.addEventListener("click", logout);
logoutUser.addEventListener("click",logout);
logoutStaff.addEventListener("click",logout);