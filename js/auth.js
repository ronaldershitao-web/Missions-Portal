/* ==========================================
   Google Identity Authentication
========================================== */

async function handleCredentialResponse(response) {

    showLoading();

    try {

        const res = await fetch(CONFIG.API_URL, {

            method: "POST",

            headers: {
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                action:"login",

                token:response.credential

            })

        });

        const result = await res.json();

        hideLoading();

        if(result.success){

            showMessage(
                "Welcome " + result.user.name,
                "success"
            );

            console.log(result);

            // Next:
            // window.location = "dashboard.html";

        }else{

            showMessage(
                result.message,
                "danger"
            );

        }

    }
    catch(err){

        hideLoading();

        console.error(err);

        showMessage(
            "Unable to connect to server.",
            "danger"
        );

    }

}

/* ==========================================
   Decode JWT
========================================== */

function parseJwt(token){

    const base64Url = token.split('.')[1];

    const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');

    return JSON.parse(atob(base64));

}
