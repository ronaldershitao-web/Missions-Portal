let idTokenGlobal = null;
let accessTokenGlobal = null;

/* ==========================================
   GIS LOGIN (ID TOKEN ONLY)
========================================== */

function handleCredentialResponse(response) {

    showLoading();
    clearMessage();

    try {

        console.log("GIS LOGIN OK");

        idTokenGlobal = response.credential;

        // STEP 1: Start SAFE OAuth (redirect flow, NOT popup)
        startOAuthFlow();

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Login failed", "danger");
    }
}

/* ==========================================
   SAFE OAUTH FLOW (NO POPUP)
========================================== */

function startOAuthFlow() {

    const client = google.accounts.oauth2.initCodeClient({

        client_id: CONFIG.CLIENT_ID,

        scope: "https://www.googleapis.com/auth/script.scriptapp",

        ux_mode: "popup", // fallback safe mode

        callback: async (response) => {

            try {

                if (!response.code) {
                    throw new Error("No auth code returned");
                }

                console.log("AUTH CODE RECEIVED");

                // STEP 2: Exchange code for access token (via Google endpoint)
                const token = await exchangeCodeForToken(response.code);

                accessTokenGlobal = token;

                // STEP 3: Call Apps Script
                await callAppsScriptLogin(idTokenGlobal, accessTokenGlobal);

            } catch (err) {

                console.error(err);
                hideLoading();
                showMessage("OAuth failed", "danger");
            }
        }
    });

    client.requestCode();
}

/* ==========================================
   EXCHANGE CODE FOR ACCESS TOKEN
========================================== */

async function exchangeCodeForToken(code) {

    const res = await fetch("https://oauth2.googleapis.com/token", {

        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({

            code: code,
            client_id: CONFIG.CLIENT_ID,
            grant_type: "authorization_code",
            redirect_uri: "postmessage"
        })

    });

    const data = await res.json();

    if (!data.access_token) {
        throw new Error("No access token returned");
    }

    return data.access_token;
}

/* ==========================================
   APPS SCRIPT EXECUTION API
========================================== */

async function callAppsScriptLogin(idToken, accessToken) {

    const url = `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`;

    try {

        const res = await fetch(url, {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },

            body: JSON.stringify({
                function: "login",
                parameters: [idToken],
                devMode: false
            })
        });

        const data = await res.json();

        console.log("EXEC RESPONSE:", data);

        hideLoading();

        if (data.error) {

            showMessage("Execution API error", "danger");
            console.error(data.error);
            return;
        }

        const result = data.response?.result;

        if (result?.success) {

            showMessage(
                "Welcome " + result.user.name,
                "success"
            );

            console.log("LOGIN SUCCESS:", result);

            // NEXT STEP
            // localStorage.setItem("user", JSON.stringify(result.user));
            // window.location.href = "dashboard.html";

        } else {

            showMessage(result?.message || "Access denied", "danger");
        }

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Server error", "danger");
    }
}

/* ==========================================
   DEBUG JWT
========================================== */

function parseJwt(token) {

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}
