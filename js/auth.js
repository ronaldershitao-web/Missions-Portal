/* ==========================================
   AUTH FLOW (GIS + Execution API)
========================================== */

let accessToken = null;

/* ==========================================
   GIS LOGIN CALLBACK (ID TOKEN)
========================================== */

async function handleCredentialResponse(response) {

    showLoading();

    const idToken = response.credential;

    try {

        // STEP 1: Load Google API client
        await new Promise((resolve) => {
            gapi.load("client", resolve);
        });

        // STEP 2: Request OAuth Access Token
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,

            scope: "https://www.googleapis.com/auth/script.scriptapp",

            callback: async (tokenResponse) => {

                accessToken = tokenResponse.access_token;

                // STEP 3: Call Apps Script
                await callLogin(idToken, accessToken);
            }
        });

        tokenClient.requestAccessToken();

    } catch (err) {

        hideLoading();
        console.error(err);
        showMessage("Login init failed", "danger");
    }
}

/* ==========================================
   EXECUTION API CALL
========================================== */

async function callLogin(idToken, token) {

    try {

        const res = await fetch(
            `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    function: "login",
                    parameters: [idToken],
                    devMode: false
                })
            }
        );

        const data = await res.json();

        hideLoading();

        if (data.error) {

            console.error(data.error);
            showMessage("Execution API error", "danger");
            return;
        }

        const result = data.response.result;

        if (result.success) {

            showMessage(
                "Welcome " + result.user.name,
                "success"
            );

            console.log("LOGIN OK:", result);

            // NEXT STEP
            // window.location = "dashboard.html";

        } else {

            showMessage(result.message, "danger");
        }

    } catch (err) {

        hideLoading();
        console.error(err);
        showMessage("Server call failed", "danger");
    }
}

/* ==========================================
   DEBUG JWT (optional)
========================================== */

function parseJwt(token) {

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    return JSON.parse(atob(base64));
}
