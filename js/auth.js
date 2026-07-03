/* ==========================================
   Google Identity Authentication
========================================== */

function handleCredentialResponse(response) {

    if (CONFIG.DEBUG) {

        console.log("JWT Received");

        console.log(response);

    }

    showLoading();

    const token = response.credential;

    if (!token) {

        hideLoading();

        showMessage(
            "Authentication failed.",
            "danger"
        );

        return;

    }

    // Decode JWT for display only
    const payload = parseJwt(token);

    console.log(payload);

    showMessage(

        "Welcome " + payload.name,

        "success"

    );

    /*
       Phase 2

       fetch(CONFIG.API_URL,{
            method:"POST",
            body:JSON.stringify({
                action:"login",
                token:token
            })
       })

    */

    setTimeout(function(){

        hideLoading();

    },1000);

}

/* ==========================================
   Decode JWT
========================================== */

function parseJwt(token){

    const base64Url = token.split('.')[1];

    const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');

    return JSON.parse(atob(base64));

}
