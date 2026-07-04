let idTokenGlobal = null;

async function handleCredentialResponse(response) {

    showLoading();
    clearMessage();

    try {

        console.log("ID TOKEN RECEIVED");

        idTokenGlobal = response.credential;

        // DIRECT CALL - NO SECOND POPUP
        await callAppsScriptLogin(idTokenGlobal);

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Login failed", "danger");
    }
}

/* ==========================================
   CALL APPS SCRIPT (NO SECOND OAUTH)
========================================== */

async function callAppsScriptLogin(idToken) {

    try {

        const res = await fetch(
            `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`,
            {
                method: "POST",
                headers: {

                    // ⚠️ IMPORTANT: This must be REMOVED for now
                    // "Authorization": "Bearer " + token,

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

        } else {

            showMessage(result?.message || "Access denied", "danger");
        }

    } catch (err) {

        console.error(err);
        hideLoading();
        showMessage("Server error", "danger");
    }
}
