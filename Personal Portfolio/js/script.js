function toggleMenu() {
    const navLinks = document.getElementById("nav-links");
    navLinks.classList.toggle("show");
  }
document.querySelector(".work-btn").addEventListener("click", function () {
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
  });
  
  document.querySelector(".contact-btn").addEventListener("click", function () {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
  
  function showTab(tabId) {
    const tabs = document.getElementsByClassName("tabContent");

    // Hide all tab content
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].style.display = "none";
    }

    // Show selected tab
    document.getElementById(tabId).style.display = "block";
  }

  // Show "Education" by default on page load
  window.onload = function() {
    showTab('education');
  };

document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent actual form submission
  
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
  
    if (!name || !email || !subject || !message) {
      alert('Please fill out all fields.');
      return;
    }
  
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    alert('Message sent successfully!');
  });
  
  // Email Validation Function
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // JavaScript function to handle onclick event
  function displayText() {
    // Get the education div
    var educationDiv = document.getElementById("education");
  
    // Check if the div exists
    if (educationDiv) {
      // Toggle the display property between 'block' and 'none'
      if (educationDiv.style.display === "block") {
        educationDiv.style.display = "none"; // Hide the div
      } else {
        educationDiv.style.display = "block"; // Show the div
      }
    } else {
      console.error("Element with ID 'education' not found.");
    }
  }
  
  // Ensure the education section is hidden by default
  document.addEventListener("DOMContentLoaded", function () {
    var educationDiv = document.getElementById("education");
    if (educationDiv) {
      educationDiv.style.display = "none";
    }
  });
  
  
  

