// Configuration file for API endpoints
// IMPORTANT: Do not commit this file with real credentials to public repositories
// Add config.js to .gitignore

const CONFIG = {
    // API 1: Authentication endpoint - called on page load with phone and password
    // Returns access token which is used for API 2 and API 3
    api1: {
        url: 'https://api.example.com/auth/login',
        method: 'POST',
        phone: 'YOUR_PHONE_NUMBER',
        password: 'YOUR_PASSWORD',
        headers: {
            // Add any additional headers if needed
        },
        // Optional: if token is in a nested field, specify it here
        // tokenField: 'data.access_token'
    },

    // API 2: Broker information (access token from API1 will be added automatically)
    // Form fields: username, displayName, phoneNumber, email
    api2: {
        url: 'https://api.example.com/endpoint2',
        method: 'POST',
        headers: {
            // Additional headers (Authorization will be added automatically)
        }
    },

    // API 3: Client onboarding endpoint (access token from API1 will be added automatically)
    api3: {
        url: 'https://api.example.com/client/onboarding',
        method: 'POST',
        headers: {
            // Additional headers (Authorization will be added automatically)
        }
    }
};

