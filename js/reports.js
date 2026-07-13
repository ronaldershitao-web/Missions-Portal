/* ===========================================================
   Missions Intelligence Dashboard
   reports.js
   Part 1 - Core Engine
=========================================================== */

/* ===========================================================
   CONFIG
=========================================================== */

const Dashboard = {

    rawData: [],
    filteredData: [],

    headers: [],
    COL: {},

    charts: {},

    filters: {

        year: "",
        eventType: "",
        church: "",
        search: ""

    }

};

/* ===========================================================
   INITIALISE
=========================================================== */

document.addEventListener("DOMContentLoaded", initialiseDashboard);

async function initialiseDashboard(){

    try{

        showLoading();

        await authenticateUser();

        await loadMasterResponses();

        buildColumnMap();

        populateFilters();

        refreshDashboard();

        updateLastRefresh();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    finally{

        hideLoading();

    }

}

/* ===========================================================
   AUTHENTICATION
=========================================================== */

async function authenticateUser(){

    if(typeof authenticate === "function"){

        await authenticate();

    }

}

/* ===========================================================
   LOAD DATA
=========================================================== */

async function loadMasterResponses() {

    const result = await API.post("getMasterResponses");

    if (!result.success) {
        throw new Error(result.message);
    }

    Dashboard.headers = result.headers;
    Dashboard.rawData = result.rows;
    Dashboard.filteredData = [...result.rows];

}
/* ===========================================================
   COLUMN MAP
=========================================================== */

function buildColumnMap(){

    const h = Dashboard.headers;

    Dashboard.COL = {

        name:
            h.indexOf("Name"),

        church:
            h.indexOf("Church"),

        gender:
            h.indexOf("Gender"),

        age:
            h.indexOf("Age"),

        event:
            h.indexOf("Event"),

        eventType:
            h.indexOf("Event Type"),

        eventDate:
            h.indexOf("Event Date"),

        attendance:
            h.indexOf("Attendance"),

        participantID:
            h.indexOf("Participant ID")

    };

}

/* ===========================================================
   FILTERS
=========================================================== */

function populateFilters(){

    populateYearFilter();

    populateChurchFilter();

    populateEventTypeFilter();

}

/* ===========================================================
   YEAR
=========================================================== */

function populateYearFilter(){

    const select =
        document.getElementById("yearFilter");

    const years =
        [...new Set(

            Dashboard.rawData.map(r=>{

                const d =
                    new Date(r[Dashboard.COL.eventDate]);

                return d.getFullYear();

            })

        )].sort();

    years.forEach(year=>{

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent = year;

        select.appendChild(option);

    });

}

/* ===========================================================
   CHURCH
=========================================================== */

function populateChurchFilter(){

    const select =
        document.getElementById("churchFilter");

    const churches =
        [...new Set(

            Dashboard.rawData.map(

                r=>r[Dashboard.COL.church]

            )

        )].sort();

    churches.forEach(church=>{

        const option =
            document.createElement("option");

        option.value = church;

        option.textContent = church;

        select.appendChild(option);

    });

}

/* ===========================================================
   EVENT TYPE
=========================================================== */

function populateEventTypeFilter(){

    const select =
        document.getElementById("eventTypeFilter");

    const types =
        [...new Set(

            Dashboard.rawData.map(

                r=>r[Dashboard.COL.eventType]

            )

        )].sort();

    types.forEach(type=>{

        const option =
            document.createElement("option");

        option.value = type;

        option.textContent = type;

        select.appendChild(option);

    });

}

/* ===========================================================
   REFRESH
=========================================================== */

function refreshDashboard(){

    readFilters();

    applyFilters();

    renderKPIs();

    renderExecutiveSummary();

    renderStrategicInsights();

    renderParticipantAnalytics();

    renderChurchAnalytics();

    renderMissionAnalytics();

    renderLeadershipAnalytics();

    renderEventTable();

    renderParticipantTable();

}

/* ===========================================================
   READ FILTERS
=========================================================== */

function readFilters(){

    Dashboard.filters.year =
        document.getElementById("yearFilter").value;

    Dashboard.filters.church =
        document.getElementById("churchFilter").value;

    Dashboard.filters.eventType =
        document.getElementById("eventTypeFilter").value;

    Dashboard.filters.search =
        document
        .getElementById("searchBox")
        .value
        .trim()
        .toLowerCase();

}

/* ===========================================================
   APPLY FILTERS
=========================================================== */

function applyFilters(){

    Dashboard.filteredData =
        Dashboard.rawData.filter(row=>{

            const year =
                new Date(
                    row[Dashboard.COL.eventDate]
                ).getFullYear().toString();

            if(
                Dashboard.filters.year &&
                year!==Dashboard.filters.year
            ) return false;

            if(
                Dashboard.filters.church &&
                row[Dashboard.COL.church]
                !==Dashboard.filters.church
            ) return false;

            if(
                Dashboard.filters.eventType &&
                row[Dashboard.COL.eventType]
                !==Dashboard.filters.eventType
            ) return false;

            if(Dashboard.filters.search){

                const text =
                    row.join(" ")
                    .toLowerCase();

                if(
                    !text.includes(
                        Dashboard.filters.search
                    )
                ){

                    return false;

                }

            }

            return true;

        });

}

/* ===========================================================
   LOADING
=========================================================== */

function showLoading(){

    document
        .getElementById("loadingOverlay")
        .classList
        .remove("hidden");

}

function hideLoading(){

    document
        .getElementById("loadingOverlay")
        .classList
        .add("hidden");

}

/* ===========================================================
   LAST REFRESH
=========================================================== */

function updateLastRefresh(){

    document
        .getElementById("lastRefresh")
        .textContent =
        new Date().toLocaleString();

}

/* ===========================================================
   ANALYTICS ENGINE
=========================================================== */

function calculateAnalytics() {

    const rows = Dashboard.filteredData;
    const C = Dashboard.COL;

    const analytics = {

        totalRegistrations: rows.length,

        uniqueParticipants: new Set(),

        repeatParticipants: 0,

        churches: new Map(),

        events: new Map(),

        eventTypes: new Map(),

        gender: new Map(),

        ages: {
            under18: 0,
            age18to25: 0,
            age26to35: 0,
            age36to45: 0,
            age46to55: 0,
            age56plus: 0
        },

        monthly: new Map(),

        participantCount: new Map()

    };

    rows.forEach(row => {

        const name = row[C.name] || "";
        const church = row[C.church] || "Unknown";
        const gender = row[C.gender] || "Unknown";
        const event = row[C.event] || "";
        const eventType = row[C.eventType] || "";
        const age = Number(row[C.age]) || 0;

        analytics.uniqueParticipants.add(name);

        analytics.churches.set(
            church,
            (analytics.churches.get(church) || 0) + 1
        );

        analytics.events.set(
            event,
            (analytics.events.get(event) || 0) + 1
        );

        analytics.eventTypes.set(
            eventType,
            (analytics.eventTypes.get(eventType) || 0) + 1
        );

        analytics.gender.set(
            gender,
            (analytics.gender.get(gender) || 0) + 1
        );

        analytics.participantCount.set(
            name,
            (analytics.participantCount.get(name) || 0) + 1
        );

        if(age < 18)
            analytics.ages.under18++;

        else if(age <=25)
            analytics.ages.age18to25++;

        else if(age<=35)
            analytics.ages.age26to35++;

        else if(age<=45)
            analytics.ages.age36to45++;

        else if(age<=55)
            analytics.ages.age46to55++;

        else
            analytics.ages.age56plus++;

        const date =
            new Date(row[C.eventDate]);

        if(!isNaN(date)){

            const key =
                date.getFullYear() + "-" +
                String(date.getMonth()+1).padStart(2,"0");

            analytics.monthly.set(
                key,
                (analytics.monthly.get(key)||0)+1
            );

        }

    });

    analytics.uniqueParticipants =
        analytics.uniqueParticipants.size;

    analytics.repeatParticipants =
        [...analytics.participantCount.values()]
        .filter(x=>x>1)
        .length;

    analytics.churchCount =
        analytics.churches.size;

    analytics.eventCount =
        analytics.events.size;

    analytics.eventTypeCount =
        analytics.eventTypes.size;

    return analytics;

}

/* ===========================================================
   KPI CARDS
=========================================================== */

function renderKPIs(){

    const A =
        calculateAnalytics();

    setValue(
        "kpiRegistrations",
        A.totalRegistrations
    );

    setValue(
        "kpiUnique",
        A.uniqueParticipants
    );

    setValue(
        "kpiRepeat",
        A.repeatParticipants
    );

    setValue(
        "kpiEvents",
        A.eventCount
    );

    setValue(
        "kpiChurches",
        A.churchCount
    );

    setValue(
        "kpiAttendance",
        calculateAttendanceRate()+"%"
    );

    setValue(
        "kpiGrowth",
        calculateGrowth()+"%"
    );

    setValue(
        "kpiLeaders",
        calculatePotentialLeaders()
    );

}

/* ===========================================================
   EXECUTIVE SUMMARY
=========================================================== */

function renderExecutiveSummary(){

    const A =
        calculateAnalytics();

    const html = `

    <ul>

    <li>
    ${A.totalRegistrations}
    registrations recorded.
    </li>

    <li>
    ${A.uniqueParticipants}
    unique participants.
    </li>

    <li>
    ${A.repeatParticipants}
    repeat missionaries.
    </li>

    <li>
    ${A.eventCount}
    mission events organised.
    </li>

    <li>
    ${A.churchCount}
    churches represented.
    </li>

    <li>
    ${
        getLargestChurch(A)
    }
    contributed the highest number of participants.
    </li>

    </ul>

    `;

    document
        .getElementById(
            "executiveSummary"
        )
        .innerHTML =
        html;

}

/* ===========================================================
   STRATEGIC INSIGHTS
=========================================================== */

function renderStrategicInsights(){

    const A =
        calculateAnalytics();

    const celebrate = [];

    const warning = [];

    const recommendation = [];

    if(
        A.repeatParticipants > 20
    ){

        celebrate.push(
            "Strong returning missionary base."
        );

    }

    if(
        A.churchCount < 3
    ){

        warning.push(
            "Mission participation is concentrated in very few churches."
        );

    }

    if(
        A.repeatParticipants <
        A.uniqueParticipants * 0.25
    ){

        recommendation.push(
            "Develop a retention strategy to encourage participants to return for future missions."
        );

    }

    document
        .getElementById(
            "celebrateInsights"
        )
        .innerHTML =
        createList(celebrate);

    document
        .getElementById(
            "warningInsights"
        )
        .innerHTML =
        createList(warning);

    document
        .getElementById(
            "recommendationInsights"
        )
        .innerHTML =
        createList(recommendation);

}

/* ===========================================================
   HELPERS
=========================================================== */

function setValue(id,value){

    document
        .getElementById(id)
        .textContent =
        value;

}

function createList(items){

    if(items.length===0){

        return "<p>No significant insights.</p>";

    }

    return "<ul>" +

        items.map(x=>
            `<li>${x}</li>`
        ).join("")

        +

        "</ul>";

}

function getLargestChurch(A){

    let max = 0;

    let church = "-";

    A.churches.forEach((value,key)=>{

        if(value>max){

            max = value;

            church = key;

        }

    });

    return church;

}

/* ===========================================================
   PLACEHOLDER FUNCTIONS
=========================================================== */

function calculateAttendanceRate(){

    return 91;

}

function calculateGrowth(){

    return 14;

}

function calculatePotentialLeaders(){

    return 18;

}

/* ===========================================================
   CHART MANAGER
=========================================================== */

function destroyChart(id) {

    if (Dashboard.charts[id]) {
        Dashboard.charts[id].destroy();
        delete Dashboard.charts[id];
    }

}

function createChart(id, type, labels, data, label = "") {

    destroyChart(id);

    const canvas = document.getElementById(id);

    if (!canvas) return;

    Dashboard.charts[id] = new Chart(canvas, {

        type,

        data: {

            labels,

            datasets: [{

                label,

                data,

                borderWidth: 2,
                tension: 0.35,
                fill: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            }

        }

    });

}

/* ===========================================================
   PARTICIPANT ANALYTICS
=========================================================== */

function renderParticipantAnalytics() {

    const A = Dashboard.analytics;


    renderAgeChart(A);

    renderExperienceChart(A);

    renderFirstTimeChart(A);

}

/* ===========================================================
   GENDER
=========================================================== */



/* ===========================================================
   AGE
=========================================================== */

function renderAgeChart(A) {

    createChart(

        "ageChart",

        "bar",

        [

            "<18",
            "18-25",
            "26-35",
            "36-45",
            "46-55",
            "56+"

        ],

        [

            A.ages.under18,
            A.ages.age18to25,
            A.ages.age26to35,
            A.ages.age36to45,
            A.ages.age46to55,
            A.ages.age56plus

        ],

        "Participants"

    );

}

/* ===========================================================
   EXPERIENCE
=========================================================== */

function renderExperienceChart(A) {

    const buckets = {

        "1 Mission": 0,
        "2 Missions": 0,
        "3 Missions": 0,
        "4+ Missions": 0

    };

    A.participantCount.forEach(count => {

        if (count === 1)
            buckets["1 Mission"]++;

        else if (count === 2)
            buckets["2 Missions"]++;

        else if (count === 3)
            buckets["3 Missions"]++;

        else
            buckets["4+ Missions"]++;

    });

    createChart(

        "experienceChart",

        "doughnut",

        Object.keys(buckets),

        Object.values(buckets),

        "Mission Experience"

    );

}

/* ===========================================================
   FIRST TIME VS RETURNING
=========================================================== */

function renderFirstTimeChart(A) {

    createChart(

        "firstTimeReturningChart",

        "pie",

        [

            "First Time",

            "Returning"

        ],

        [

            A.uniqueParticipants - A.repeatParticipants,

            A.repeatParticipants

        ],

        "Missionaries"

    );

}

/* ===========================================================
   CHURCH ANALYTICS
=========================================================== */

function renderChurchAnalytics() {

    const A = Dashboard.analytics;

    createChart(

        "churchChart",

        "bar",

        [...A.churches.keys()],

        [...A.churches.values()],

        "Participants"

    );

}

/* ===========================================================
   EVENT ANALYTICS
=========================================================== */

function renderMissionAnalytics() {

    const A = Dashboard.analytics;

    createChart(

        "eventTypeChart",

        "bar",

        [...A.eventTypes.keys()],

        [...A.eventTypes.values()],

        "Registrations"

    );

    createChart(

        "eventPopularityChart",

        "bar",

        [...A.events.keys()],

        [...A.events.values()],

        "Participants"

    );

    renderTimelineChart(A);

}

/* ===========================================================
   TIMELINE
=========================================================== */

function renderTimelineChart(A) {

    const months =
        [...A.monthly.keys()].sort();

    const values =
        months.map(m => A.monthly.get(m));

    createChart(

        "timelineChart",

        "line",

        months,

        values,

        "Registrations"

    );

}

/* ===========================================================
   LEADERSHIP
=========================================================== */

function renderLeadershipAnalytics() {

    const A = Dashboard.analytics;

    const experienced =
        [...A.participantCount.values()]
        .filter(x => x >= 3)
        .length;

    createChart(

        "leadershipPipelineChart",

        "doughnut",

        [

            "Emerging",

            "Potential Leaders"

        ],

        [

            A.uniqueParticipants - experienced,

            experienced

        ],

        "Leadership"

    );

}

/* ===========================================================
   EVENT SUMMARY TABLE
=========================================================== */

function renderEventTable() {

    const tbody =
        document.getElementById("eventSummaryTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    const C = Dashboard.COL;

    const eventMap = new Map();

    Dashboard.filteredData.forEach(row => {

        const event = row[C.event];

        if (!eventMap.has(event)) {

            eventMap.set(event, {

                date: row[C.eventDate],
                type: row[C.eventType],
                registered: 0,
                attended: 0,
                participants: new Set()

            });

        }

        const item = eventMap.get(event);

        item.registered++;

        if (
            String(row[C.attendance])
            .toLowerCase()
            .includes("yes")
        ) {

            item.attended++;

        }

        item.participants.add(
            row[C.name]
        );

    });

    eventMap.forEach((item, event) => {

        const tr =
            document.createElement("tr");

        const attendance =
            item.registered
                ? ((item.attended / item.registered) * 100).toFixed(1)
                : "0";

        tr.innerHTML = `

            <td>${item.date}</td>

            <td>${event}</td>

            <td>${item.type}</td>

            <td>${item.registered}</td>

            <td>${item.attended}</td>

            <td>${attendance}%</td>

            <td>${item.participants.size}</td>

            <td>-</td>

            <td>-</td>

            <td>${attendance >= 80 ? "Healthy" : "Review"}</td>

        `;

        tbody.appendChild(tr);

    });

}

/* ===========================================================
   PARTICIPANT TABLE
=========================================================== */

function renderParticipantTable() {

    const tbody =
        document.getElementById(
            "participantSummaryTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    const C = Dashboard.COL;

    const participants = new Map();

    Dashboard.filteredData.forEach(row => {

        const name =
            row[C.name];

        if (!participants.has(name)) {

            participants.set(name, {

                church: row[C.church],

                gender: row[C.gender],

                age: row[C.age],

                missions: 0,

                attendance: 0

            });

        }

        const p =
            participants.get(name);

        p.missions++;

        if (
            String(row[C.attendance])
            .toLowerCase()
            .includes("yes")
        ) {

            p.attendance++;

        }

    });

    participants.forEach((p, name) => {

        const tr =
            document.createElement("tr");

        const rate =
            ((p.attendance / p.missions) * 100).toFixed(0);

        tr.innerHTML = `

        <td>${name}</td>

        <td>${p.church}</td>

        <td>${p.gender}</td>

        <td>${p.age}</td>

        <td>${p.missions}</td>

        <td>${p.attendance}</td>

        <td>${rate}%</td>

        <td>${p.missions >= 3 ? "Potential" : "-"}</td>

        <td>Active</td>

        `;

        tr.onclick = () => {

            showParticipant(name);

        };

        tbody.appendChild(tr);

    });

}

/* ===========================================================
   TOP CONTRIBUTORS
=========================================================== */

function renderTopContributors() {

    renderTopMissionaries();

    renderTopChurches();

    renderTopEvents();

}

function renderTopMissionaries() {

    const tbody =
        document.getElementById(
            "topMissionaries"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    const list =
        [...Dashboard.analytics.participantCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    list.forEach(item => {

        tbody.innerHTML += `

        <tr>

        <td>${item[0]}</td>

        <td>${item[1]}</td>

        </tr>

        `;

    });

}

function renderTopChurches() {

    const tbody =
        document.getElementById(
            "topChurches"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    [...Dashboard.analytics.churches.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(item => {

            tbody.innerHTML += `

            <tr>

            <td>${item[0]}</td>

            <td>${item[1]}</td>

            </tr>

            `;

        });

}

function renderTopEvents() {

    const tbody =
        document.getElementById(
            "topEvents"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    [...Dashboard.analytics.events.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(item => {

            tbody.innerHTML += `

            <tr>

            <td>${item[0]}</td>

            <td>${item[1]}</td>

            </tr>

            `;

        });

}

/* ===========================================================
   MODAL
=========================================================== */

function showParticipant(name) {

    const modal =
        document.getElementById("detailsModal");

    const title =
        document.getElementById("modalTitle");

    const body =
        document.getElementById("modalBody");

    title.textContent = name;

    body.innerHTML = `
        <p>Participant details will appear here.</p>
    `;

    modal.classList.remove("hidden");

}

function closeModal() {

    document
        .getElementById("detailsModal")
        .classList
        .add("hidden");

}

/* ===========================================================
   EXPORT CSV
=========================================================== */

function exportCSV() {

    const rows = Dashboard.filteredData;

    let csv =
        Dashboard.headers.join(",") + "\n";

    rows.forEach(r => {

        csv +=
            r.join(",") + "\n";

    });

    const blob =
        new Blob([csv]);

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "missions.csv";

    a.click();

}

/* ===========================================================
   EXCEL
=========================================================== */

function exportExcel() {

    exportCSV();

}

/* ===========================================================
   BACK
=========================================================== */

function goBack() {

    history.back();

}
