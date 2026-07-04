/* ==========================================
   Google Login + Execution API
========================================== */

let accessToken = null;

/* ==========================================
   GIS Callback (ID TOKEN ONLY)
========================================== */

async function handleCredentialResponse(response) {

    showLoading();

    try {

        const idToken = response.credential;

        // 1. Load OAuth token client
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: "https://www.googleapis.com/auth/script.projects",
            callback: async (tokenResponse) => {

                accessToken = tokenResponse.access_token;

                // 2. Call Apps Script Execution API
                await callLogin(idToken, accessToken);

            }
        });

        // 3. Request access token
        tokenClient.requestAccessToken();

    } catch (err) {

        hideLoading();
        console.error(err);
        showMessage("Login failed", "danger");

    }
}

/* ==========================================
   CALL APPS SCRIPT (Execution API)
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

        // Execution API response format
        const result = data.response.result;

        if (result.success) {

            showMessage(
                "Welcome " + result.user.name,
                "success"
            );

            console.log("LOGIN SUCCESS:", result);

            // TODO: redirect
            // window.location = "dashboard.html";

        } else {

            showMessage(result.message, "danger");

        }

    } catch (err) {

        hideLoading();
        console.error(err);
        showMessage("Execution API failed", "danger");

    }
}

/* ==========================================
   JWT Decoder (optional debug)
========================================== */

function parseJwt(token) {

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));

}
