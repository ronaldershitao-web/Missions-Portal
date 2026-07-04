/* ==========================================
   Missions Portal - AUTH (FINAL STABLE VERSION)
========================================== */

let idTokenGlobal = null;

/* ==========================================
   MAIN GIS CALLBACK (ID TOKEN ONLY)
========================================== */

async function handleCredentialResponse(response) {

    showLoading();
    clearMessage();

    try {

        // 1. Store ID token from Google Identity Services
        idTokenGlobal = response.credential;

        console.log("ID TOKEN RECEIVED");

        // 2. Directly call Apps Script (NO gapi, NO extra OAuth popup)
        await callAppsScriptLogin(idTokenGlobal);

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Login failed (client error)", "danger");
    }
}

/* ==========================================
   APPS SCRIPT EXECUTION API CALL
========================================== */

async function callAppsScriptLogin(idToken) {

    try {

        const url = `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`;

        const payload = {
            function: "login",
            parameters: [idToken],
            devMode: false
        };

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + await getAccessToken()
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        console.log("EXECUTION API RESPONSE:", data);

        hideLoading();

        // API error check
        if (data.error) {
            showMessage("Execution API error", "danger");
            console.error(data.error);
            return;
        }

        const result = data.response?.result;

        if (!result) {
            showMessage("Invalid server response", "danger");
            return;
        }

        // Success path
        if (result.success) {

            showMessage(
                "Welcome " + result.user.name,
                "success"
            );

            console.log("LOGIN SUCCESS:", result);

            // NEXT STEP
            // window.location.href = "dashboard.html";

        } else {

            showMessage(result.message || "Access denied", "danger");
        }

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Server connection failed", "danger");
    }
}

/* ==========================================
   GET ACCESS TOKEN (NO POPUP LOOP VERSION)
========================================== */

function getAccessToken() {

    return new Promise((resolve, reject) => {

        try {

            const client = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,

                // REQUIRED scope for Execution API
                scope: "https://www.googleapis.com/auth/script.scriptapp",

                callback: (tokenResponse) => {

                    if (!tokenResponse || !tokenResponse.access_token) {
                        reject("No access token received");
                        return;
                    }

                    resolve(tokenResponse.access_token);
                }
            });

            client.requestAccessToken();

        } catch (err) {
            reject(err);
        }
    });
}

/* ==========================================
   OPTIONAL: JWT DEBUG
========================================== */

function parseJwt(token) {

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        console.error("JWT parse error", e);
        return null;
    }
}
