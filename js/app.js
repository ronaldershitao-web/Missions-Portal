/* ==========================================
   Missions Portal
========================================== */

window.onload = function(){

    console.log(CONFIG.APP_NAME);

    console.log(CONFIG.VERSION);

};

/* ==========================================
   Loading
========================================== */

function showLoading(){

    document
        .getElementById("loadingArea")
        .classList
        .remove("d-none");

}

function hideLoading(){

    document
        .getElementById("loadingArea")
        .classList
        .add("d-none");

}

/* ==========================================
   Messages
========================================== */

function showMessage(message,type){

    document.getElementById("message").innerHTML =

    `<div class="alert alert-${type}">

        ${message}

    </div>`;

}

/* ==========================================
   Clear Message
========================================== */

function clearMessage(){

    document.getElementById("message").innerHTML = "";

}
