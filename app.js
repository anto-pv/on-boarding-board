// API Configuration - will be loaded from config.js
let apiConfig = {};
// Store access token after API1 authentication
let accessToken = null;
// Store userId after API2 response
let userId = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load configuration
        if (typeof CONFIG !== 'undefined') {
            apiConfig = CONFIG;
        } else {
            throw new Error('Configuration not found. Please check config.js');
        }

        // Update status
        updateStatus('Ready - Enter credentials to authenticate', '');
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        updateResult('api1-result', `Error: ${error.message}`, 'error');
    }

    // Setup event listeners
    // Disable API 2 and API 3 buttons until authentication succeeds
    document.getElementById('api2-btn').disabled = true;
    document.getElementById('api3-btn').disabled = true;
    document.getElementById('api1-btn').addEventListener('click', callAPI1);
    document.getElementById('api2-btn').addEventListener('click', callAPI2);
    document.getElementById('api3-btn').addEventListener('click', callAPI3);
    
    // Initialize userId as null
    userId = null;
});

// API 1: Authentication with mobile number and MPIN from HTML form
async function callAPI1() {
    const resultElement = document.getElementById('api1-result');
    const buttonElement = document.getElementById('api1-btn');
    
    // Get values from input fields
    const phoneNumber = document.getElementById('api1-phoneNumber').value.trim();
    const mpin = document.getElementById('api1-mpin').value.trim();

    // Validate required fields
    if (!phoneNumber || !mpin) {
        updateResult(resultElement, 'Please enter phone number and MPIN', 'error');
        return;
    }

    updateResult(resultElement, 'Authenticating with API 1...', 'loading');
    buttonElement.disabled = true;

    try {
        // Build request body from form fields and config
        const requestBody = {
            phoneNumber: phoneNumber,
            mpin: mpin
        };
        
        // Add deviceId from config if available
        if (apiConfig.api1.deviceId) {
            requestBody.deviceId = apiConfig.api1.deviceId;
        }

        const response = await fetch(apiConfig.api1.url, {
            method: apiConfig.api1.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...apiConfig.api1.headers
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Extract access token from response
            // First try custom tokenField if specified
            if (apiConfig.api1.tokenField) {
                const fieldPath = apiConfig.api1.tokenField.split('.');
                let tokenValue = data;
                for (const field of fieldPath) {
                    tokenValue = tokenValue?.[field];
                }
                accessToken = tokenValue;
            }
            
            // If not found, try common field names
            if (!accessToken) {
                accessToken = data.accessToken || data.access_token || data.token || 
                            data.data?.accessToken || data.data?.access_token ||
                            data.result?.accessToken || data.result?.access_token ||
                            data.response?.accessToken || data.response?.access_token;
            }
            
            if (accessToken) {
                updateResult(resultElement, `Authentication successful!\nAccess Token: ${accessToken.substring(0, 20)}...\n\nFull response:\n${JSON.stringify(data, null, 2)}`, 'success');
                updateStatus('API 1: Authenticated ✓', 'success');
                
                // Enable API 2 and API 3 buttons
                document.getElementById('api2-btn').disabled = false;
                document.getElementById('api3-btn').disabled = false;
            } else {
                updateResult(resultElement, `Authentication response received but no access token found.\nResponse: ${JSON.stringify(data, null, 2)}\n\nPlease check the token field name in config.js (tokenField).\n\nTried: accessToken, access_token, token, data.accessToken, data.access_token`, 'error');
                updateStatus('API 1: No token found', 'error');
            }
        } else {
            updateResult(resultElement, `Error ${response.status}: ${JSON.stringify(data, null, 2)}`, 'error');
            updateStatus('API 1: Authentication Failed', 'error');
            accessToken = null;
        }
    } catch (error) {
        updateResult(resultElement, `Error: ${error.message}`, 'error');
        updateStatus('API 1: Error', 'error');
        accessToken = null;
    } finally {
        buttonElement.disabled = false;
    }
}

// API 2: Uses form fields for broker information
async function callAPI2() {
    const resultElement = document.getElementById('api2-result');
    const buttonElement = document.getElementById('api2-btn');

    // Get values from input fields
    const username = document.getElementById('api2-username').value.trim();
    const displayName = document.getElementById('api2-displayName').value.trim();
    const phoneNumber = document.getElementById('api2-phoneNumber').value.trim();
    const email = document.getElementById('api2-email').value.trim();

    // Validate required fields
    if (!username || !displayName || !phoneNumber || !email) {
        updateResult(resultElement, 'Please fill in all fields (username, displayName, phoneNumber, email)', 'error');
        return;
    }

    // Check if access token is available
    if (!accessToken) {
        updateResult(resultElement, 'Please wait for API 1 authentication to complete', 'error');
        return;
    }

    updateResult(resultElement, 'Calling API 2...', 'loading');
    buttonElement.disabled = true;

    try {
        // Build request body from form fields
        const body = {
            username: username,
            displayName: displayName,
            phoneNumber: phoneNumber,
            email: email
        };

        const response = await fetch(apiConfig.api2.url, {
            method: apiConfig.api2.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...apiConfig.api2.headers
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            // Extract userId from response (try multiple possible field names)
            userId = data.userId || data.user_id || data.id || 
                     data.data?.userId || data.data?.user_id || data.data?.id ||
                     data.result?.userId || data.result?.user_id || data.result?.id ||
                     data.response?.userId || data.response?.user_id || data.response?.id;
            
            if (userId) {
                updateResult(resultElement, `Success! UserId extracted: ${userId}\n\nFull response:\n${JSON.stringify(data, null, 2)}`, 'success');
                updateStatus('API 2: Success - UserId saved', 'success');
                
                // Enable API 3 button
                document.getElementById('api3-btn').disabled = false;
            } else {
                updateResult(resultElement, `Success but userId not found in response.\nResponse: ${JSON.stringify(data, null, 2)}\n\nTried: userId, user_id, id, data.userId, etc.`, 'error');
                updateStatus('API 2: No userId found', 'error');
                userId = null;
            }
        } else {
            updateResult(resultElement, `Error ${response.status}: ${JSON.stringify(data, null, 2)}`, 'error');
            updateStatus('API 2: Failed', 'error');
            userId = null;
        }
    } catch (error) {
        updateResult(resultElement, `Error: ${error.message}`, 'error');
        updateStatus('API 2: Error', 'error');
    } finally {
        buttonElement.disabled = false;
    }
}

// API 3: Client onboarding with mpin
async function callAPI3() {
    const resultElement = document.getElementById('api3-result');
    const mpinElement = document.getElementById('api3-mpin');
    const buttonElement = document.getElementById('api3-btn');

    const mpin = mpinElement.value.trim();

    if (!mpin) {
        updateResult(resultElement, 'Please enter MPIN', 'error');
        return;
    }

    // Check if access token is available
    if (!accessToken) {
        updateResult(resultElement, 'Please wait for API 1 authentication to complete', 'error');
        return;
    }

    // Check if userId is available from API 2
    if (!userId) {
        updateResult(resultElement, 'Please call API 2 first to get userId', 'error');
        return;
    }

    updateResult(resultElement, 'Calling API 3...', 'loading');
    buttonElement.disabled = true;

    try {
        // Build request body with mpin and userId from API 2
        const bodyData = {
            mpin: mpin,
            userId: userId
        };

        const response = await fetch(apiConfig.api3.url, {
            method: apiConfig.api3.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...apiConfig.api3.headers
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (response.ok) {
            updateResult(resultElement, JSON.stringify(data, null, 2), 'success');
            updateStatus('API 3: Success', 'success');
        } else {
            updateResult(resultElement, `Error ${response.status}: ${JSON.stringify(data, null, 2)}`, 'error');
            updateStatus('API 3: Failed', 'error');
        }
    } catch (error) {
        updateResult(resultElement, `Error: ${error.message}`, 'error');
        updateStatus('API 3: Error', 'error');
    } finally {
        buttonElement.disabled = false;
    }
}

// Helper functions
function updateStatus(message, type = '') {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status-box ${type}`;
}

function updateResult(element, message, type = '') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    element.textContent = message;
    element.className = `result-box ${type}`;
}

