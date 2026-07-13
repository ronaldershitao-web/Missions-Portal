/* ==========================================================
   Missions Intelligence Dashboard
   reports.js
   Part 1 - Initialization
========================================================== */

console.log("Missions Intelligence Dashboard");

/* ==========================================================
   GLOBAL DASHBOARD STATE
========================================================== */

const Dashboard = {

    data: null,

    charts: {},

    filters: {

        year: "",
        church: "",
        eventType: "",
        search: ""

    }

};

/* ==========================================================
   PAGE LOAD
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialiseDashboard
);

/* ==========================================================
   INITIALISE
========================================================== */

async function initialiseDashboard() {

    try {

        showLoading();

        await loadDashboard();

        renderDashboard();

        updateLastRefresh();

    }
    catch (err) {

        console.error(err);

        alert(
            err.message ||
            "Unable to load dashboard."
        );

    }
    finally {

        hideLoading();

    }

}

/* ==========================================================
   LOAD DASHBOARD
========================================================== */

async function loadDashboard() {

    const result =
        await API.post(
            "getMissionDashboard",
            Dashboard.filters
        );


    if (!result.success) {

        throw new Error(result.message);

    }


    Dashboard.data =
        result.data;



    // Load Mission Trip Compilation KPI
    const missionResult =
        await API.post(
            "getMissionCompilationReport",
            {}
        );


    if (!missionResult.success) {

        throw new Error(
            missionResult.message
        );

    }


    Dashboard.missionData =
        missionResult.data;


}

/* ==========================================================
   REFRESH
========================================================== */

async function refreshDashboard() {

    await initialiseDashboard();

}

/* ==========================================================
   RENDER EVERYTHING
========================================================== */

function renderDashboard() {

    if (!Dashboard.data)
        return;

    renderKPIs();

     renderMissionTripSummary(); 

    renderMissionInsights();

    renderParticipantCharts();

    renderChurchCharts();

    renderEventCharts();

    renderLeadershipCharts();

    renderEventSummaryTable();

    renderParticipantDirectory();

    renderTopContributors();

    populateFilters();

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    document
        .getElementById("loadingOverlay")
        ?.classList.remove("hidden");

}

function hideLoading() {

    document
        .getElementById("loadingOverlay")
        ?.classList.add("hidden");

}

/* ==========================================================
   LAST REFRESH
========================================================== */

function updateLastRefresh() {

    document
        .getElementById("lastRefresh")
        .textContent =
            new Date()
            .toLocaleString();

}

/* ==========================================================
   BACK BUTTON
========================================================== */

function goBack() {

    history.back();

}

/* ==========================================================
   PART 2
   KPI + EXECUTIVE SUMMARY + MINISTRY INSIGHTS
========================================================== */

/* ==========================================================
   KPI CARDS
========================================================== */

function renderKPIs() {

    const k = Dashboard.data.kpis;


    setText(
        "kpiRegistrations",
        k.registrations
    );


    setText(
        "kpiUnique",
        k.uniqueParticipants
    );


    setText(
        "kpiReturning",
        k.repeatParticipants
    );


    setText(
        "kpiFirstTimers",
        k.firstTimers
    );


    setText(
        "kpiEvents",
        k.totalEvents
    );


    setText(
        "kpiChurches",
        k.totalChurches
    );


    setText(
        "kpiAttendance",
        k.attendanceRate + "%"
    );


    setText(
        "kpiAverageEvent",
        Dashboard.data.events.averages.average
    );



    // ====================================
    // Mission Trip KPIs
    // ====================================

    const m =
    Dashboard.missionData;


    if(m){

        setText(
            "kpiMissionTrips",
            m.totalTrips
        );


        setText(
            "kpiTrippers",
            m.uniqueMissionaries
        );


        setText(
            "kpiAvgTeam",
            m.averageParticipants
        );

    }


}

/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */


/* ==========================================================
   MINISTRY INSIGHTS
========================================================== */

function renderMissionInsights() {

    const insights =
        Dashboard.data.missionInsights || {};


    renderInsightList(
        "celebrateInsights",
        insights.celebrate
    );


    renderInsightList(
        "followupInsights",
        insights.warning
    );


    renderInsightList(
        "opportunityInsights",
        insights.recommendation
    );


    renderInsightList(
        "riskInsights",
        insights.risk
    );


}
/* ==========================================================
   PASTOR'S CORNER
========================================================== */

function renderStrategicCorner() {

    const executive =
        Dashboard.data.executive;

    const div =
        document.getElementById(
            "missionIntelligence"
        );

    div.innerHTML = "";

    addPastorCard(

        div,

        "Mission Health",

        executive.healthScore +

        "/100"

    );

    addPastorCard(

        div,

        "Mission Stage",

        executive.healthDescriptor

    );

    addPastorCard(

        div,

        "Highest Participation",

        executive.topChurch

    );

    addPastorCard(

        div,

        "Most Popular Event",

        executive.topEvent

    );

    addPastorCard(

        div,

        "Repeat Missionaries",

        executive.repeatParticipants

    );

}

/* ==========================================================
   INSIGHT LIST
========================================================== */

function renderInsightList(

    elementId,

    items

){

    const container =
        document.getElementById(
            elementId
        );

    container.innerHTML = "";

    if(
        !items ||
        items.length===0
    ){

        container.innerHTML =
            "<p>No insights available.</p>";

        return;

    }

    items.forEach(item=>{

        const li =
            document.createElement("div");

        li.className =
            "insightItem";

        li.innerHTML =
            "• " + item;

        container.appendChild(li);

    });

}

/* ==========================================================
   EXECUTIVE ROW
========================================================== */

function addInsightRow(

    container,

    label,

    value

){

    const row =
        document.createElement("div");

    row.className =
        "summaryRow";

    row.innerHTML =

        `<span>${label}</span>
         <strong>${value}</strong>`;

    container.appendChild(row);

}

/* ==========================================================
   PASTOR CARD
========================================================== */

function addPastorCard(

    container,

    title,

    value

){

    const card =
        document.createElement("div");

    card.className =
        "pastorCard";

    card.innerHTML =

        `
        <div class="pastorTitle">

            ${title}

        </div>

        <div class="pastorValue">

            ${value}

        </div>
        `;

    container.appendChild(card);

}

/* ==========================================================
   SMALL HELPER
========================================================== */

function setText(

    id,

    value

){

    const el =
        document.getElementById(id);

    if(el)

        el.textContent = value;

}




/* ==========================================================
   PART 3
   GENERIC CHART ENGINE
========================================================== */

/* ==========================================================
   PARTICIPANT CHARTS
========================================================== */

function renderParticipantCharts() {

    const p = Dashboard.data.participants;

    renderChart(
 "newReturningChart",
 "doughnut",
 p.firstTimeVsReturning
);

    renderChart(
        "ageChart",
        "bar",
        p.ageDistribution
    );

    renderChart(
        "churchChart",
        "bar",
        p.churchDistribution
    );

    renderChart(
        "participantsTimelineChart",
        "line",
        Dashboard.data.events.monthlyTrend
    );

}

/* ==========================================================
   CHURCH CHARTS
========================================================== */

function renderChurchCharts() {

    const c = Dashboard.data.churches;

    renderChart(
        "churchGrowthChart",
        "line",
        c.growth
    );

    renderChart(
        "churchRetentionChart",
        "bar",
        c.retention
    );

    renderChart(
        "topChurchChart",
        "bar",
        c.participation
    );

}

/* ==========================================================
   EVENT CHARTS
========================================================== */

function renderEventCharts() {

    const e = Dashboard.data.events;

    renderChart(
        "eventTypeChart",
        "pie",
        e.eventTypes
    );

    renderChart(
        "eventPopularityChart",
        "bar",
        e.popularity
    );

    renderChart(
        "attendanceChart",
        "bar",
        e.attendance
    );

    renderChart(
        "monthlyTrendChart",
        "line",
        e.monthlyTrend
    );

    renderChart(
        "timelineChart",
        "line",
        convertTimeline(e.timeline)
    );

    renderAverageAttendance(
        e.averages.average
    );

}

/* ==========================================================
   LEADERSHIP CHARTS
========================================================== */

function renderLeadershipCharts() {

    const l =
        Dashboard.data.leadership;

    renderChart(
        "leadershipPipelineChart",
        "bar",
        l.pipeline
    );

    renderChart(
        "experienceLevelChart",
        "pie",
        l.experience
    );

    renderChart(
        "leaderCandidatesChart",
        "bar",
        convertPeopleChart(
            l.leaderCandidates,
            "events"
        )
    );

    renderChart(
        "repeatMissionariesChart",
        "bar",
        convertPeopleChart(
            l.repeatMissionaries,
            "events"
        )
    );

}

/* ==========================================================
   GENERIC CHART
========================================================== */

function renderChart(

    canvasId,

    chartType,

    dataset,

    options={}

){

    if(!dataset)
        return;

    const canvas =
        document.getElementById(
            canvasId
        );

    if(!canvas)
        return;

    if(
        Dashboard.charts[canvasId]
    ){

        Dashboard.charts[
            canvasId
        ].destroy();

    }

    Dashboard.charts[
        canvasId
    ] = new Chart(

        canvas,

        {

            type: chartType,

            data:{

                labels:
                    dataset.labels,

                datasets:[{

                    label:

                        options.label ||

                        "",

                    data:

                        dataset.values,

                    borderWidth:1,

                    fill:false

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:

                            chartType!=="bar"

                    }

                },

                scales:

                    chartType==="pie" ||

                    chartType==="doughnut"

                    ?{}

                    :{

                        y:{

                            beginAtZero:true

                        }

                    }

            }

        }

    );

}

/* ==========================================================
   TIMELINE CONVERTER
========================================================== */

function convertTimeline(list){

    return{

        labels:

            list.map(

                x=>x.date

            ),

        values:

            list.map(

                x=>x.participants

            )

    };

}

/* ==========================================================
   PEOPLE -> CHART
========================================================== */

function convertPeopleChart(

    people,

    field

){

    return{

        labels:

            people.map(

                p=>p.name

            ),

        values:

            people.map(

                p=>p[field]

            )

    };

}

/* ==========================================================
   AVERAGE EVENT SIZE
========================================================== */

function renderAverageAttendance(avg){

    const canvas =
        document.getElementById(
            "averageAttendanceChart"
        );

    if(!canvas)
        return;

    if(
        Dashboard.charts.averageAttendanceChart
    ){

        Dashboard.charts
            .averageAttendanceChart
            .destroy();

    }

    Dashboard.charts
        .averageAttendanceChart =

        new Chart(

            canvas,

            {

                type:"bar",

                data:{

                    labels:[
                        "Average"
                    ],

                    datasets:[{

                        data:[avg]

                    }]

                },

                options:{

                    responsive:true,

                    plugins:{

                        legend:{

                            display:false

                        }

                    },

                    scales:{

                        y:{

                            beginAtZero:true

                        }

                    }

                }

            }

        );

}

/* ==========================================================
   PART 4
   TABLE RENDERERS
========================================================== */

/* ==========================================================
   EVENT SUMMARY TABLE
========================================================== */

function renderEventSummaryTable() {

    const tbody =
        document.getElementById(
            "eventSummaryTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    Dashboard.data.tables.eventSummary.forEach(event => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${formatDate(event.date)}</td>

            <td>${event.event}</td>

            <td>${event.type}</td>

            <td>${event.registered}</td>

            <td>${event.attended}</td>

            <td>${event.attendance}%</td>

            <td>${event.firstTimers}</td>

            <td>${event.repeat}</td>

            <td>${event.churches}</td>

            <td>${event.status}</td>

        `;

        tr.style.cursor = "pointer";

        tr.onclick = () => {

            openEventDetails(
                event.event
            );

        };

        tbody.appendChild(tr);

    });

}

/* ==========================================================
   PARTICIPANT DIRECTORY
========================================================== */

function renderParticipantDirectory() {

    const tbody =
        document.getElementById(
            "participantSummaryTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    Dashboard.data.tables.participantSummary.forEach(person => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${person.name}</td>

            <td>${person.church}</td>

            <td>${person.age || "-"}</td>

            <td>${person.events}</td>

            <td>${person.attendanceRate}%</td>

            <td>${person.leadership}</td>

            <td>${person.status}</td>

        `;

        tr.style.cursor = "pointer";

        tr.onclick = () => {

            openParticipantDetails(
                person.email
            );

        };

        tbody.appendChild(tr);

    });

}

/* ==========================================================
   TOP CONTRIBUTORS
========================================================== */

function renderTopContributors(){

    renderTopMissionaries();

    renderTopChurches();

    renderTopEvents();

}

/* ==========================================================
   TOP MISSIONARIES
========================================================== */

function renderTopMissionaries(){

    const tbody =
        document.getElementById(
            "topMissionaries"
        );

    if(!tbody) return;

    tbody.innerHTML="";

    Dashboard.data.tables.topMissionaries.forEach(person=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${person.name}</td>

            <td>${person.events}</td>

        `;

        tbody.appendChild(tr);

    });

}

/* ==========================================================
   TOP CHURCHES
========================================================== */

function renderTopChurches(){

    const tbody =
        document.getElementById(
            "topChurches"
        );

    if(!tbody) return;

    tbody.innerHTML="";

    Dashboard.data.tables.topChurches.forEach(church=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML=`

            <td>${church.church}</td>

            <td>${church.participants}</td>

        `;

        tbody.appendChild(tr);

    });

}

/* ==========================================================
   TOP EVENTS
========================================================== */

function renderTopEvents(){

    const tbody =
        document.getElementById(
            "topEvents"
        );

    if(!tbody) return;

    tbody.innerHTML="";

    Dashboard.data.tables.topEvents.forEach(event=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML=`

            <td>${event.event}</td>

            <td>${event.participants}</td>

        `;

        tbody.appendChild(tr);

    });

}

/* ==========================================================
   EVENT DETAILS
========================================================== */

async function openEventDetails(eventName){

    showLoading();

    try{

        const result =
            await API.post(

                "getEventDetails",

                {

                    event:eventName

                }

            );

        if(!result.success)
            throw new Error(result.message);

        openModal(

            eventName,

            result.data

        );

    }

    catch(err){

        alert(err.message);

    }

    finally{

        hideLoading();

    }

}

/* ==========================================================
   PARTICIPANT DETAILS
========================================================== */

async function openParticipantDetails(email){

    showLoading();

    try{

        const result =
            await API.post(

                "getParticipantDetails",

                {

                    email:email

                }

            );

        if(!result.success)
            throw new Error(result.message);

        openModal(

            email,

            result.data

        );

    }

    catch(err){

        alert(err.message);

    }

    finally{

        hideLoading();

    }

}

/* ==========================================================
   MODAL
========================================================== */

function openModal(

    title,

    data

){

    document
        .getElementById(
            "modalTitle"
        ).textContent = title;

    const body =
        document.getElementById(
            "modalBody"
        );

    body.innerHTML =
        "<pre>" +
        JSON.stringify(
            data,
            null,
            2
        ) +
        "</pre>";

    document
        .getElementById(
            "detailsModal"
        )
        .classList
        .remove(
            "hidden"
        );

}

/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeModal(){

    document
        .getElementById(
            "detailsModal"
        )
        .classList
        .add(
            "hidden"
        );

}

/* ==========================================================
   DATE FORMATTER
========================================================== */

function formatDate(date){

    if(!date)
        return "-";

    try {

        return new Date(date)
            .toLocaleDateString(
                "en-SG",
                {
                    year:"numeric",
                    month:"short",
                    day:"numeric"
                }
            );

    }
    catch(err){

        return date;

    }

}

function exportExcel(){

    alert(
        "Excel export coming soon."
    );

}


function exportCSV(){

    alert(
        "CSV export coming soon."
    );

}

function exportEventTable(){

    alert(
        "Event export coming soon."
    );

}

function exportParticipants(){

    alert(
        "Participant export coming soon."
    );

}

/* ==========================================================
   FILTER POPULATION
========================================================== */

function populateFilters(){

    const filters =
        Dashboard.data.filters;

    if(!filters)
        return;


    populateSelect(
        "yearFilter",
        filters.years
    );


    populateSelect(
        "eventTypeFilter",
        filters.eventTypes
    );


    populateSelect(
        "churchFilter",
        filters.churches
    );


    populateSelect(
        "referralFilter",
        filters.referrals
    );

}



/* ==========================================================
   SELECT HELPER
========================================================== */

function populateSelect(
    id,
    values
){

    const select =
        document.getElementById(id);


    if(!select || !values)
        return;


    // keep first "All" option
    const first =
        select.options[0];


    select.innerHTML = "";


    select.appendChild(first);


    values.forEach(value=>{

        const option =
            document.createElement(
                "option"
            );

        option.value = value;

        option.textContent = value;


        select.appendChild(option);

    });

}

async function loadMissionDashboard(){

 const result = await API.post(
   "getMissionTripDashboard",
   {}
 );


 if(result.success){

  document.getElementById("kpiMissionTrips").innerText =
data.totalTrips;


  document.getElementById("kpiTrippers").innerText =
data.totalParticipants;


   document.getElementById("kpiCountries").innerText =
data.countriesReached;


    document.getElementById("kpiAvgTeam").innerText =
data.averageParticipants;


    document.getElementById("missionAnalysis")
    .innerHTML =
    result.data.analysis
    .map(x=>`<p>• ${x}</p>`)
    .join("");

 }

}

function renderMissionTripSummary() {

    const tbody =
        document.getElementById("missionTripSummaryTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Dashboard.missionData ||
        !Dashboard.missionData.tripSummary) {
        return;
    }

    Dashboard.missionData.tripSummary.forEach(trip => {

        tbody.innerHTML += `
            <tr>
                <td>${trip.tripCode}</td>
                <td>${trip.location}</td>
                <td>${formatDate(trip.startDate)}</td>
                <td>${trip.participants}</td>
            </tr>
        `;

    });

}
