// pass_login.js
document.getElementById('loginForm').addEventListener('submit', function(event) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email) {
        alert('Please enter your email.');
        event.preventDefault(); // Prevent form submission
    } else if (!password) {
        alert('Please enter your password.');
        event.preventDefault(); // Prevent form submission
    } else {
        // Optionally, add more sophisticated validation or handling here
    }
});
