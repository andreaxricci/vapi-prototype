const jwt = require("jsonwebtoken");

// Define the payload
const payload = {
    orgId: '',
};

// Get the private key from environment variables
const key = '';

// Define token options
const options = {
    expiresIn: '1h',
};

// Generate the token
const token = jwt.sign(payload, key, options);

console.log("Bearer Token:", token);

