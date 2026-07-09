/* ==========================================
   Missions Portal - AUTH
   (GIS + Apps Script Web App)
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

        // Store ID Token from Google Identity Services
        idTokenGlobal = response.credential;

        // OPTIONAL DEBUG
        // console.log(parseJwt(idTokenGlobal));

        // Send ID Token to Apps Script Web App
        await callAppsScriptLogin(idTokenGlobal);

    } catch (err) {

        console.error(err);

        hideLoading();

        showMessage("Login failed", "danger");
    }
}

/* ==========================================
   APPS SCRIPT WEB APP LOGIN
========================================== */

async function callAppsScriptLogin(idToken) {

    try {

        const formData = new URLSearchParams();

        formData.append("action", "login");
        formData.append("token", idToken);

        const res = await fetch(CONFIG.WEB_APP_URL, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();

        console.log(result);

        hideLoading();

        if (result.success) {

            localStorage.setItem(
                "mp_user",
                JSON.stringify(result.user)
            );

            window.location.href = "dashboard.html";

        } else {

            showMessage(result.message, "danger");

        }

    } catch (err) {

        console.error(err);

        hideLoading();

        showMessage("Server connection failed", "danger");

    }

}

/* ==========================================
   OPTIONAL DEBUG: JWT PARSER
========================================== */

function parseJwt(token) {

    try {

        const base64Url = token.split(".")[1];

        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    } catch (e) {

        console.error("JWT parse error", e);

        return null;

    }

}
