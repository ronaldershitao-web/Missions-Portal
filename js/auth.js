/* ==========================================
   Missions Portal - AUTH (STABLE VERSION)
========================================== */

let idTokenGlobal = null;

/* ==========================================
   GOOGLE LOGIN CALLBACK (GIS)
========================================== */

async function handleCredentialResponse(response) {

    showLoading();
    clearMessage();

    try {

        console.log("GIS LOGIN SUCCESS");

        // 1. Store ID token from Google Identity Services
        idTokenGlobal = response.credential;

        // OPTIONAL DEBUG
        // console.log(parseJwt(idTokenGlobal));

        // 2. Directly call Apps Script Execution API
        await callAppsScriptLogin(idTokenGlobal);

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Login failed", "danger");
    }
}

/* ==========================================
   APPS SCRIPT EXECUTION API CALL
========================================== */

async function callAppsScriptLogin(idToken) {

    try {

      //  const url = `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`;
       
       fetch(WEB_APP_URL,{
    method:"POST",
    body:JSON.stringify({
        action:"login",
        idToken:idToken
    })
});
       

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
            console.error(data.error);
            showMessage("Execution API error", "danger");
            return;
        }

        const result = data.response?.result;

        if (!result) {
            showMessage("Invalid server response", "danger");
            return;
        }

        // =========================
        // SUCCESS
        // =========================
        if (result.success) {

            console.log("LOGIN SUCCESS:", result);

            localStorage.setItem("mp_user", JSON.stringify(result.user));

            window.location.href = "dashboard.html";

        } 
        // =========================
        // FAIL
        // =========================
        else {

            showMessage(result.message || "Access denied", "danger");
        }

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Server connection failed", "danger");
    }
}

/* ==========================================
   GET OAUTH ACCESS TOKEN (SINGLE FLOW)
========================================== */
let accessTokenCache = null;
let tokenExpiryTime = 0;

function getAccessToken() {

    return new Promise((resolve, reject) => {

        const now = Date.now();

        // =========================
        // 1. USE CACHE IF VALID
        // =========================
        if (accessTokenCache && now < tokenExpiryTime) {
            resolve(accessTokenCache);
            return;
        }

        try {

            const tokenClient = google.accounts.oauth2.initTokenClient({

                client_id: CONFIG.CLIENT_ID,

                scope: [
                    "https://www.googleapis.com/auth/script.scriptapp",
                    "https://www.googleapis.com/auth/spreadsheets",
                    "https://www.googleapis.com/auth/drive.readonly"
                ].join(" "),

                callback: (tokenResponse) => {

                    if (!tokenResponse || !tokenResponse.access_token) {
                        reject("No access token received");
                        return;
                    }

                    // =========================
                    // 2. CACHE TOKEN
                    // =========================
                    accessTokenCache = tokenResponse.access_token;

                    // expire in ~50 minutes (safe buffer)
                    tokenExpiryTime = Date.now() + 50 * 60 * 1000;

                    resolve(accessTokenCache);
                }
            });

            tokenClient.requestAccessToken();

        } catch (err) {
            reject(err);
        }
    });
}
/* ==========================================
   OPTIONAL DEBUG: JWT PARSER
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
