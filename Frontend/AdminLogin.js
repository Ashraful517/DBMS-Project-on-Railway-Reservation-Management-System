// AdminLogin.js
document.getElementById('AdminloginForm').addEventListener('submit', function(event) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username) {
        alert('Please enter your username.');
        event.preventDefault(); // Prevent form submission
    }

    if (!password) {
        alert('Please enter your password.');
        event.preventDefault(); // Prevent form submission
    }
});
