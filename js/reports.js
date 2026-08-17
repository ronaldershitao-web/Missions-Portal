/* ==========================================================
   Missions Intelligence Dashboard
   reports.js
   MISSIONS + MISSION TRIPS + MISSIONAL JOURNEY
========================================================== */

console.log("Missions Intelligence Dashboard");


/* ==========================================================
   GLOBAL DASHBOARD STATE
========================================================== */

const Dashboard = {

    data: null,

    missionData: null,

    charts: {},

    filters: {

        year: "",
        month: "",
        church: "",
        eventType: "",
        referral: "",
        attendance: "",
        participant: "",
        trip: ""

    },

    initialised: false

};


/* ==========================================================
   PAGE LOAD
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialiseDashboard
);


/* ==========================================================
   INITIALISE DASHBOARD
========================================================== */

async function initialiseDashboard() {

    try {

        showLoading();

        await loadDashboard();

        populateFilters();

        renderDashboard();

        if (!Dashboard.initialised) {

            setupFilterListeners();

            Dashboard.initialised = true;

        }

        updateLastRefresh();

    }

    catch (err) {

        console.error(
            "DASHBOARD INITIALISATION ERROR:",
            err
        );

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

    /* ------------------------------------------
       MAIN MISSION DASHBOARD
    ------------------------------------------ */

    const result =
        await API.post(
            "getMissionDashboard",
            Dashboard.filters
        );


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load mission dashboard."
        );

    }


    Dashboard.data =
        result.data;


    /* ------------------------------------------
       MISSION TRIP DASHBOARD
    ------------------------------------------ */

    const missionResult =
        await API.post(
            "getMissionCompilationReport",
            Dashboard.filters
        );


    if (!missionResult.success) {

        throw new Error(
            missionResult.message ||
            "Unable to load mission trip data."
        );

    }


    Dashboard.missionData =
        missionResult.data;

}


/* ==========================================================
   APPLY FILTERS
========================================================== */

async function applyFilters() {

    try {

        showLoading();

        await loadDashboard();

        renderDashboard();

        updateLastRefresh();

    }

    catch (err) {

        console.error(
            "FILTER ERROR:",
            err
        );

        alert(
            err.message ||
            "Unable to apply filters."
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   REFRESH
========================================================== */

async function refreshDashboard() {

    await applyFilters();

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

    renderMissionalJourney();


}


/* ==========================================================
   FILTER LISTENERS
========================================================== */

function setupFilterListeners() {

    const filterMap = {

        yearFilter: "year",

        monthFilter: "month",

        eventTypeFilter: "eventType",

        churchFilter: "church",

        referralFilter: "referral",

        attendanceFilter: "attendance",

        tripFilter: "trip"

    };


    Object.keys(filterMap).forEach(id => {

        const element =
            document.getElementById(id);


        if (!element)
            return;


        element.addEventListener(
            "change",
            async function () {

                Dashboard.filters[
                    filterMap[id]
                ] = this.value;


                await applyFilters();

            }
        );

    });


    /* ------------------------------------------
       PARTICIPANT SEARCH
    ------------------------------------------ */

    const participantSearch =
        document.getElementById(
            "participantFilter"
        );


    if (participantSearch) {

        participantSearch.addEventListener(
            "input",
            debounce(
                async function () {

                    Dashboard.filters.participant =
                        this.value.trim();


                    await applyFilters();

                },
                400
            )
        );

    }


    /* ------------------------------------------
       LEGACY SEARCH BOX
    ------------------------------------------ */

    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (
        searchBox &&
        !participantSearch
    ) {

        searchBox.addEventListener(
            "input",
            debounce(
                async function () {

                    Dashboard.filters.participant =
                        this.value.trim();


                    await applyFilters();

                },
                400
            )
        );

    }

}


/* ==========================================================
   KPI RENDERING
========================================================== */

function renderKPIs() {

    const k =
        Dashboard.data.kpis || {};


    /* ==========================================
       MISSION EVENT KPIs
    ========================================== */

    setText(
        "kpiEvents",
        k.totalEvents || 0
    );


    setText(
        "kpiUnique",
        k.uniqueParticipants || 0
    );


    setText(
        "kpiAttended",
        k.attended || 0
    );


    setText(
        "kpiReturning",
        k.repeatParticipants || 0
    );


    /* ------------------------------------------
       Legacy KPI IDs
    ------------------------------------------ */

    setText(
        "kpiRegistrations",
        k.registrations || 0
    );


    setText(
        "kpiFirstTimers",
        k.firstTimers || 0
    );


    setText(
        "kpiChurches",
        k.totalChurches || 0
    );


    setText(
        "kpiAttendance",
        (k.attendanceRate || 0) + "%"
    );


    if (
        Dashboard.data.events &&
        Dashboard.data.events.averages
    ) {

        setText(
            "kpiAverageEvent",
            Dashboard.data.events.averages.average || 0
        );

    }


    /* ==========================================
       MISSION TRIP KPIs
    ========================================== */

    const m =
        Dashboard.missionData;


    if (!m)
        return;


    setText(
        "kpiMissionTrips",
        m.totalTrips || 0
    );


    setText(
        "kpiMissionUnique",
        m.uniqueMissionaries || 0
    );


    setText(
        "kpiTrippers",
        m.totalDeployments || 0
    );


    setText(
        "kpiMissionRecurring",
        m.recurringMissionaries || 0
    );


    /* ------------------------------------------
       Existing IDs
    ------------------------------------------ */

    setText(
        "kpiAvgTeam",
        m.averageParticipants || 0
    );

}


/* ==========================================================
   MISSION TRIP SUMMARY
========================================================== */

function renderMissionTripSummary() {

    const tbody =
        document.getElementById(
            "missionTripSummaryTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    if (
        !Dashboard.missionData ||
        !Dashboard.missionData.tripSummary
    )
        return;


    Dashboard.missionData.tripSummary
        .forEach(trip => {


            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>${escapeHTML(
                    trip.tripCode || "-"
                )}</td>

                <td>${escapeHTML(
                    trip.location || "-"
                )}</td>

                <td>${formatDate(
                    trip.startDate
                )}</td>

                <td>${trip.participants || 0}</td>

            `;


            tbody.appendChild(tr);

        });

}


/* ==========================================================
   TOP CONTRIBUTORS
========================================================== */

function renderTopContributors() {

    renderTopMissionaries();

    renderTopChurches();

    renderTopEvents();

}


/* ==========================================================
   TOP MISSIONARIES
========================================================== */

function renderTopMissionaries() {

    const tbody =
        document.getElementById(
            "topMissionaries"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const people =
        Dashboard.data.tables &&
        Dashboard.data.tables.topMissionaries
            ? Dashboard.data.tables.topMissionaries
            : [];


    people.slice(0, 5)
        .forEach((person, index) => {


            const tr =
                document.createElement("tr");


            tr.style.cursor =
                "pointer";


            tr.innerHTML = `

                <td>${index + 1}</td>

                <td>${escapeHTML(
                    person.name || "-"
                )}</td>

                <td>${person.events || 0}</td>

            `;


            tr.onclick = () => {

                openMissionalJourney(
                    person.mobile
                );

            };


            tbody.appendChild(tr);

        });

}


/* ==========================================================
   TOP CHURCHES
========================================================== */

function renderTopChurches() {

    const tbody =
        document.getElementById(
            "topChurches"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const churches =
        Dashboard.data.tables &&
        Dashboard.data.tables.topChurches
            ? Dashboard.data.tables.topChurches
            : [];


    churches.forEach(church => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>${escapeHTML(
                church.church || "-"
            )}</td>

            <td>${church.participants || 0}</td>

        `;


        tbody.appendChild(tr);

    });

}


/* ==========================================================
   TOP EVENTS
========================================================== */

function renderTopEvents() {

    const tbody =
        document.getElementById(
            "topEvents"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const events =
        Dashboard.data.tables &&
        Dashboard.data.tables.topEvents
            ? Dashboard.data.tables.topEvents
            : [];


    events.forEach(event => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>${escapeHTML(
                event.event || "-"
            )}</td>

            <td>${event.participants || 0}</td>

        `;


        tbody.appendChild(tr);

    });

}


/* ==========================================================
   MISSIONAL JOURNEY
========================================================== */

function renderMissionalJourney() {

    const container =
        document.getElementById(
            "missionalJourneyPeople"
        );


    if (!container)
        return;


    container.innerHTML = "";


    const people =
        Dashboard.data.missionalJourney &&
        Dashboard.data.missionalJourney.topParticipants
            ? Dashboard.data.missionalJourney.topParticipants
            : [];


    if (people.length === 0) {

        container.innerHTML =
            "<p>No participants found.</p>";

        return;

    }


    people.slice(0, 5)
        .forEach((person, index) => {


            const card =
                document.createElement("div");


            card.className =
                "journeyPersonCard";


            card.style.cursor =
                "pointer";


            card.innerHTML = `

                <div class="journeyRank">
                    #${index + 1}
                </div>

                <div class="journeyPersonName">
                    ${escapeHTML(
                        person.name || "Unknown"
                    )}
                </div>

                <div class="journeyPersonChurch">
                    ${escapeHTML(
                        person.church || "-"
                    )}
                </div>

                <div class="journeyPersonStats">

                    <span>
                        ${person.events || 0}
                        Events
                    </span>

                    <span>
                        ${person.missionTrips || 0}
                        Mission Trips
                    </span>

                </div>

            `;


            card.onclick = () => {

                openMissionalJourney(
                    person.mobile
                );

            };


            container.appendChild(card);

        });

}


/* ==========================================================
   OPEN MISSIONAL JOURNEY
========================================================== */

async function openMissionalJourney(
    mobile
) {

    if (!mobile) {

        alert(
            "This participant does not have a phone number recorded."
        );

        return;

    }


    try {

        showLoading();


        const result =
            await API.post(

                "getMissionalJourney",

                {

                    mobile: mobile,

                    filters:
                        Dashboard.filters

                }

            );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load missional journey."
            );

        }


        renderMissionalJourneyModal(
            result.data
        );

    }

    catch (err) {

        console.error(err);

        alert(
            err.message ||
            "Unable to load missional journey."
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   MISSIONAL JOURNEY MODAL
========================================================== */

function renderMissionalJourneyModal(
    journey
) {

    const title =
        document.getElementById(
            "modalTitle"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!title || !body)
        return;


    title.textContent =
        journey.person.name ||
        "Missional Journey";


    let html = `

        <div class="missionalJourney">

            <div class="journeyHeader">

                <h3>
                    ${escapeHTML(
                        journey.person.name
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        journey.person.church || "-"
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        journey.person.mobile || "-"
                    )}
                </p>

            </div>


            <div class="journeySummary">

                <div>
                    <strong>
                        ${journey.summary.events}
                    </strong>
                    <span>Mission Events</span>
                </div>

                <div>
                    <strong>
                        ${journey.summary.attended}
                    </strong>
                    <span>Events Attended</span>
                </div>

                <div>
                    <strong>
                        ${journey.summary.missionTrips}
                    </strong>
                    <span>Mission Trips</span>
                </div>

                <div>
                    <strong>
                        ${journey.summary.totalEngagements}
                    </strong>
                    <span>Total Engagements</span>
                </div>

            </div>


            <div class="journeyTimeline">

                <h3>
                    Missional Journey
                </h3>

    `;


    const timeline =
        journey.timeline || [];


    if (timeline.length === 0) {

        html += `
            <p>
                No journey records found.
            </p>
        `;

    }
    else {

        timeline.forEach(item => {

            html += `

                <div class="journeyTimelineItem">

                    <div class="journeyDate">

                        ${formatDate(
                            item.date
                        )}

                    </div>

                    <div class="journeyMarker">
                        ●
                    </div>

                    <div class="journeyContent">

                        <div class="journeyType">

                            ${escapeHTML(
                                item.type || ""
                            )}

                        </div>

                        <h4>

                            ${escapeHTML(
                                item.name || "-"
                            )}

                        </h4>

                        ${
                            item.location
                            ? `
                                <p>
                                    ${escapeHTML(
                                        item.location
                                    )}
                                </p>
                              `
                            : ""
                        }

                        ${
                            item.attended !== undefined
                            ? `
                                <span>
                                    ${
                                        item.attended
                                        ? "Attended"
                                        : "Did not attend"
                                    }
                                </span>
                              `
                            : ""
                        }

                    </div>

                </div>

            `;

        });

    }


    html += `

            </div>

        </div>


        <div class="journeyActions">

            <button
                type="button"
                onclick="printMissionalJourney()"
            >
                Print / Export Journey
            </button>

        </div>

    `;


    body.innerHTML =
        html;


    document
        .getElementById(
            "detailsModal"
        )
        ?.classList
        .remove("hidden");


    Dashboard.currentJourney =
        journey;

}


/* ==========================================================
   PRINT MISSIONAL JOURNEY
========================================================== */

function printMissionalJourney() {

    if (!Dashboard.currentJourney) {

        alert(
            "No missional journey selected."
        );

        return;

    }


    const journey =
        Dashboard.currentJourney;


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to export the journey."
        );

        return;

    }


    let html = `

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Missional Journey -
                ${escapeHTML(
                    journey.person.name
                )}
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:40px;

                    color:#222;

                }

                h1 {

                    margin-bottom:5px;

                }

                .meta {

                    color:#666;

                    margin-bottom:30px;

                }

                .summary {

                    display:flex;

                    gap:30px;

                    margin-bottom:30px;

                }

                .summaryBox {

                    border:1px solid #ddd;

                    padding:15px;

                }

                .summaryBox strong {

                    display:block;

                    font-size:24px;

                }

                .timelineItem {

                    display:flex;

                    gap:20px;

                    margin-bottom:20px;

                    padding-bottom:20px;

                    border-bottom:1px solid #eee;

                }

                .date {

                    width:100px;

                    font-weight:bold;

                }

                .type {

                    font-size:12px;

                    text-transform:uppercase;

                    color:#777;

                }

            </style>

        </head>

        <body>

            <h1>
                Missional Journey
            </h1>

            <div class="meta">

                <strong>
                    ${escapeHTML(
                        journey.person.name
                    )}
                </strong>

                <br>

                ${escapeHTML(
                    journey.person.church || "-"
                )}

            </div>


            <div class="summary">

                <div class="summaryBox">

                    <strong>
                        ${journey.summary.events}
                    </strong>

                    Mission Events

                </div>

                <div class="summaryBox">

                    <strong>
                        ${journey.summary.attended}
                    </strong>

                    Events Attended

                </div>

                <div class="summaryBox">

                    <strong>
                        ${journey.summary.missionTrips}
                    </strong>

                    Mission Trips

                </div>

            </div>


            <h2>
                Journey Timeline
            </h2>

    `;


    (journey.timeline || [])
        .forEach(item => {

            html += `

                <div class="timelineItem">

                    <div class="date">

                        ${formatDate(
                            item.date
                        )}

                    </div>

                    <div>

                        <div class="type">

                            ${escapeHTML(
                                item.type || ""
                            )}

                        </div>

                        <strong>

                            ${escapeHTML(
                                item.name || "-"
                            )}

                        </strong>

                        ${
                            item.location
                            ? `
                                <div>
                                    ${escapeHTML(
                                        item.location
                                    )}
                                </div>
                              `
                            : ""
                        }

                    </div>

                </div>

            `;

        });


    html += `

        </body>

        </html>

    `;


    printWindow.document.write(
        html
    );

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

}


/* ==========================================================
   EXISTING EVENT SUMMARY TABLE
========================================================== */

function renderEventSummaryTable() {

    const tbody =
        document.getElementById(
            "eventSummaryTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const events =
        Dashboard.data.tables &&
        Dashboard.data.tables.eventSummary
            ? Dashboard.data.tables.eventSummary
            : [];


    events.forEach(event => {

        const tr =
            document.createElement("tr");


        tr.style.cursor =
            "pointer";


        tr.innerHTML = `

            <td>${formatDate(
                event.date
            )}</td>

            <td>${escapeHTML(
                event.event
            )}</td>

            <td>${escapeHTML(
                event.type
            )}</td>

            <td>${event.registered}</td>

            <td>${event.attended}</td>

            <td>${event.attendance}%</td>

            <td>${event.firstTimers}</td>

            <td>${event.repeat}</td>

            <td>${event.churches}</td>

            <td>${event.status}</td>

        `;


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


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const people =
        Dashboard.data.tables &&
        Dashboard.data.tables.participantSummary
            ? Dashboard.data.tables.participantSummary
            : [];


    people.forEach(person => {

        const tr =
            document.createElement("tr");


        tr.style.cursor =
            "pointer";


        tr.innerHTML = `

            <td>
                ${escapeHTML(
                    person.name || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    person.church || "-"
                )}
            </td>

            <td>
                ${person.age || "-"}
            </td>

            <td>
                ${person.events || 0}
            </td>

            <td>
                ${person.attendanceRate || 0}%
            </td>

            <td>
                ${person.leadership || "-"}
            </td>

            <td>
                ${person.status || "-"}
            </td>

        `;


        tr.onclick = () => {

            openMissionalJourney(
                person.mobile
            );

        };


        tbody.appendChild(tr);

    });

}


/* ==========================================================
   EVENT DETAILS
========================================================== */

async function openEventDetails(
    eventName
) {

    try {

        showLoading();


        const result =
            await API.post(

                "getEventDetails",

                {
                    event: eventName
                }

            );


        if (!result.success)
            throw new Error(
                result.message
            );


        openModal(
            eventName,
            result.data
        );

    }

    catch (err) {

        alert(
            err.message
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   GENERIC MODAL
========================================================== */

function openModal(
    title,
    data
) {

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalBody =
        document.getElementById(
            "modalBody"
        );


    if (!modalTitle ||
        !modalBody)
        return;


    modalTitle.textContent =
        title;


    modalBody.innerHTML =
        "<pre>" +
        escapeHTML(
            JSON.stringify(
                data,
                null,
                2
            )
        ) +
        "</pre>";


    document
        .getElementById(
            "detailsModal"
        )
        ?.classList
        .remove("hidden");

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeModal() {

    document
        .getElementById(
            "detailsModal"
        )
        ?.classList
        .add("hidden");

}


/* ==========================================================
   FILTER POPULATION
========================================================== */

function populateFilters() {

    const filters =
        Dashboard.data &&
        Dashboard.data.filters;


    if (!filters)
        return;


    populateSelect(
        "yearFilter",
        filters.years
    );


    populateSelect(
        "monthFilter",
        filters.months
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


    populateSelect(
        "tripFilter",
        filters.trips
    );

}


/* ==========================================================
   SELECT HELPER
========================================================== */

function populateSelect(
    id,
    values
) {

    const select =
        document.getElementById(id);


    if (
        !select ||
        !Array.isArray(values)
    )
        return;


    const currentValue =
        Dashboard.filters[
            getFilterKeyFromElement(id)
        ] || "";


    const firstText =
        select.options.length > 0
            ? select.options[0].textContent
            : "All";


    select.innerHTML = "";


    const first =
        document.createElement(
            "option"
        );


    first.value = "";

    first.textContent =
        firstText || "All";


    select.appendChild(
        first
    );


    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;

        option.textContent =
            value;


        select.appendChild(
            option
        );

    });


    if (
        values.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* ==========================================================
   FILTER KEY
========================================================== */

function getFilterKeyFromElement(
    id
) {

    const map = {

        yearFilter: "year",

        monthFilter: "month",

        eventTypeFilter: "eventType",

        churchFilter: "church",

        referralFilter: "referral",

        attendanceFilter: "attendance",

        tripFilter: "trip"

    };


    return map[id] || "";

}


/* ==========================================================
   GENERIC CHART ENGINE
========================================================== */

function renderChart(
    canvasId,
    chartType,
    dataset,
    options = {}
) {

    if (!dataset)
        return;


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas)
        return;


    if (
        Dashboard.charts[
            canvasId
        ]
    ) {

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

            data: {

                labels:
                    dataset.labels || [],

                datasets: [{

                    label:
                        options.label || "",

                    data:
                        dataset.values || [],

                    borderWidth: 1,

                    fill: false

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display:
                            chartType !== "bar"

                    }

                },

                scales:

                    chartType === "pie" ||
                    chartType === "doughnut"

                    ? {}

                    : {

                        y: {

                            beginAtZero: true

                        }

                    }

            }

        }

    );

}


/* ==========================================================
   PARTICIPANT CHARTS
========================================================== */

function renderParticipantCharts() {

    const p =
        Dashboard.data.participants;


    if (!p)
        return;


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


    if (
        Dashboard.data.events
    ) {

        renderChart(
            "participantsTimelineChart",
            "line",
            Dashboard.data.events.monthlyTrend
        );

    }

}


/* ==========================================================
   CHURCH CHARTS
========================================================== */

function renderChurchCharts() {

    const c =
        Dashboard.data.churches;


    if (!c)
        return;


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

    const e =
        Dashboard.data.events;


    if (!e)
        return;


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
        convertTimeline(
            e.timeline || []
        )
    );


    renderAverageAttendance(
        e.averages
            ? e.averages.average
            : 0
    );

}


/* ==========================================================
   LEADERSHIP CHARTS
========================================================== */

function renderLeadershipCharts() {

    const l =
        Dashboard.data.leadership;


    if (!l)
        return;


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
            l.leaderCandidates || [],
            "events"
        )
    );


    renderChart(
        "repeatMissionariesChart",
        "bar",
        convertPeopleChart(
            l.repeatMissionaries || [],
            "events"
        )
    );

}


/* ==========================================================
   TIMELINE CONVERTER
========================================================== */

function convertTimeline(
    list
) {

    return {

        labels:
            list.map(
                x => formatDate(x.date)
            ),

        values:
            list.map(
                x => x.participants
            )

    };

}


/* ==========================================================
   PEOPLE → CHART
========================================================== */

function convertPeopleChart(
    people,
    field
) {

    return {

        labels:
            people.map(
                p => p.name
            ),

        values:
            people.map(
                p => p[field]
            )

    };

}


/* ==========================================================
   AVERAGE ATTENDANCE
========================================================== */

function renderAverageAttendance(
    avg
) {

    const canvas =
        document.getElementById(
            "averageAttendanceChart"
        );


    if (!canvas)
        return;


    if (
        Dashboard.charts
            .averageAttendanceChart
    ) {

        Dashboard.charts
            .averageAttendanceChart
            .destroy();

    }


    Dashboard.charts
        .averageAttendanceChart =

        new Chart(

            canvas,

            {

                type: "bar",

                data: {

                    labels: [
                        "Average"
                    ],

                    datasets: [{

                        data: [
                            avg || 0
                        ]

                    }]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}


/* ==========================================================
   MISSION INSIGHTS
========================================================== */

function renderMissionInsights() {

    const insights =
        Dashboard.data
            .missionInsights || {};


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
   INSIGHT LIST
========================================================== */

function renderInsightList(
    elementId,
    items
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container)
        return;


    container.innerHTML = "";


    if (
        !items ||
        items.length === 0
    ) {

        container.innerHTML =
            "<p>No insights available.</p>";

        return;

    }


    items.forEach(item => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "insightItem";


        div.textContent =
            "• " + item;


        container.appendChild(
            div
        );

    });

}


/* ==========================================================
   DATE FORMATTER
========================================================== */

function formatDate(
    date
) {

    if (!date)
        return "-";


    try {

        return new Date(date)
            .toLocaleDateString(
                "en-SG",
                {

                    year: "numeric",

                    month: "short",

                    day: "numeric"

                }
            );

    }

    catch (err) {

        return date;

    }

}


/* ==========================================================
   SET TEXT
========================================================== */

function setText(
    id,
    value
) {

    const el =
        document.getElementById(
            id
        );


    if (el)
        el.textContent =
            value ?? 0;

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================================
   DEBOUNCE
========================================================== */

function debounce(
    callback,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () =>
                    callback.apply(
                        this,
                        args
                    ),
                delay
            );

    };

}


/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    document
        .getElementById(
            "loadingOverlay"
        )
        ?.classList
        .remove(
            "hidden"
        );

}


function hideLoading() {

    document
        .getElementById(
            "loadingOverlay"
        )
        ?.classList
        .add(
            "hidden"
        );

}


/* ==========================================================
   LAST REFRESH
========================================================== */

function updateLastRefresh() {

    const el =
        document.getElementById(
            "lastRefresh"
        );


    if (el) {

        el.textContent =
            new Date()
            .toLocaleString(
                "en-SG"
            );

    }

}


/* ==========================================================
   BACK BUTTON
========================================================== */

function goBack() {

    history.back();

}


/* ==========================================================
   EXPORT PLACEHOLDERS
========================================================== */

function exportExcel() {

    alert(
        "Excel export coming soon."
    );

}


function exportCSV() {

    alert(
        "CSV export coming soon."
    );


}


function exportEventTable() {

    alert(
        "Event export coming soon."
    );

}


function exportParticipants() {

    alert(
        "Participant export coming soon."
    );

}
