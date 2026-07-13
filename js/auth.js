/* ==========================================
   Missions Portal - AUTH
   (Google Identity Services + API)
========================================== */


/* ==========================================
   GOOGLE LOGIN CALLBACK (GIS)
========================================== */

async function handleCredentialResponse(response) {

    showLoading();
    clearMessage();

    try {

        console.log("GIS LOGIN SUCCESS");


        /*
            Send Google ID Token
            to Apps Script API
        */

        const result = await API.post(
            "login",
            {
                token: response.credential
            }
        );


        console.log(result);


        hideLoading();


        /*
            Login Success
        */

        if (result.success) {


            localStorage.setItem(
                "mp_user",
                JSON.stringify(
                    result.data.user
                )
            );


            window.location.href =
                "dashboard.html";


        } 
        
        /*
            Login Failed
        */

        else {


            showMessage(
                result.message,
                "danger"
            );


        }


    } catch (err) {


        console.error(
            "Login Error:",
            err
        );


        hideLoading();


        showMessage(
            "Unable to login. Please try again.",
            "danger"
        );


    }

}
