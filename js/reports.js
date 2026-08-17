/* ==========================================================
   COOS MISSIONS INTELLIGENCE DASHBOARD
   reports.js

   COMPATIBLE WITH:
   ----------------------------------------------------------
   report.gs

   Backend response structure:

   result.data
       ├── generatedAt
       ├── filters
       ├── totalRows
       └── dashboard
             ├── kpis
             ├── agm
             ├── executive
             ├── missionInsights
             ├── participants
             ├── participantJourney
             ├── topParticipants
             ├── churches
             ├── events
             ├── leadership
             ├── missionTrips
             └── tables

   PERSON IDENTITY:
       MOBILE:XXXXXXXX
       EMAIL:xxxx
       NAME:xxxx

========================================================== */

console.log(
    "COOS Missions Intelligence Dashboard"
);


/* ==========================================================
   GLOBAL DASHBOARD STATE
========================================================== */

const Dashboard = {

    data: null,

    meta: null,

    charts: {},

    filters: {

        year: "",

        startDate: "",

        endDate: ""

    },

    currentJourney: null,

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
   INITIALISE
========================================================== */

async function initialiseDashboard() {

    try {

        showLoading();

        await loadDashboard();

        populateFilters();

        renderDashboard();

        if (!Dashboard.initialised) {

            setupFilterListeners();

            setupModalListeners();

            Dashboard.initialised = true;

        }

        updateLastRefresh();

    }

    catch (err) {

        console.error(
            "DASHBOARD INITIALISATION ERROR:",
            err
        );

        showDashboardError(
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


    if (!result) {

        throw new Error(
            "No response received from dashboard API."
        );

    }


    if (!result.success) {

        throw new Error(
            result.message ||
            "Dashboard request failed."
        );

    }


    /*
     * IMPORTANT:
     *
     * report.gs returns:
     *
     * {
     *   success: true,
     *   data: {
     *      generatedAt,
     *      filters,
     *      totalRows,
     *      dashboard: {...}
     *   }
     * }
     */

    Dashboard.meta =
        result.data || {};


    Dashboard.data =
        result.data &&
        result.data.dashboard
            ? result.data.dashboard
            : {};


    console.log(
        "Dashboard loaded:",
        Dashboard.data
    );

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

        showDashboardError(
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

    renderExecutiveSummary();

    renderMissionInsights();

    renderMissionTripSummary();

    renderParticipantCharts();

    renderChurchCharts();

    renderEventCharts();

    renderLeadershipCharts();

    renderEventSummaryTable();

    renderParticipantDirectory();

    renderTopContributors();

    renderParticipantJourneySummary();

}


/* ==========================================================
   FILTER LISTENERS
========================================================== */

function setupFilterListeners() {

    /*
     * report.gs currently supports:
     *
     * year
     * startDate
     * endDate
     *
     * Do NOT send month/church/eventType/etc.
     * because the current backend does not process them.
     */


    const filterMap = {

        yearFilter: "year",

        startDateFilter: "startDate",

        endDateFilter: "endDate"

    };


    Object.keys(filterMap)
        .forEach(id => {

            const element =
                document.getElementById(id);


            if (!element)
                return;


            element.addEventListener(
                "change",
                async function () {

                    Dashboard.filters[
                        filterMap[id]
                    ] =
                        this.value || "";


                    /*
                     * If a date range is being used,
                     * clear the year filter.
                     */

                    if (
                        id === "startDateFilter" ||
                        id === "endDateFilter"
                    ) {

                        Dashboard.filters.year =
                            "";

                        const yearElement =
                            document.getElementById(
                                "yearFilter"
                            );

                        if (yearElement)
                            yearElement.value = "";

                    }


                    /*
                     * If year is selected,
                     * clear date range.
                     */

                    if (
                        id === "yearFilter" &&
                        this.value
                    ) {

                        Dashboard.filters.startDate =
                            "";

                        Dashboard.filters.endDate =
                            "";

                        const startElement =
                            document.getElementById(
                                "startDateFilter"
                            );

                        const endElement =
                            document.getElementById(
                                "endDateFilter"
                            );

                        if (startElement)
                            startElement.value = "";

                        if (endElement)
                            endElement.value = "";

                    }


                    await applyFilters();

                }
            );

        });


    /*
     * Backwards-compatible search box.
     *
     * Participant search should use the
     * participant-search API directly.
     */

    const participantSearch =
        document.getElementById(
            "participantFilter"
        );


    if (participantSearch) {

        participantSearch.addEventListener(
            "input",
            debounce(
                function () {

                    searchParticipantDirectory(
                        this.value
                    );

                },
                350
            )
        );

    }


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
                function () {

                    searchParticipantDirectory(
                        this.value
                    );

                },
                350
            )
        );

    }

}


/* ==========================================================
   MODAL LISTENERS
========================================================== */

function setupModalListeners() {

    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (!modal)
        return;


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


/* ==========================================================
   KPI RENDERING
========================================================== */

function renderKPIs() {

    const k =
        Dashboard.data.kpis || {};


    /*
     * EVENT KPIs
     */

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


    /*
     * Legacy IDs
     */

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


    setText(
        "kpiMissionHealth",
        k.missionHealthStatus || "-"
    );


    setText(
        "kpiMissionHealthScore",
        k.missionHealthScore || 0
    );


    setText(
        "kpiGrowth",
        (k.growthRate || 0) + "%"
    );


    setText(
        "kpiReferrals",
        k.referrals || 0
    );


    /*
     * Average event attendance
     */

    if (
        Dashboard.data.events &&
        Dashboard.data.events.averages
    ) {

        setText(
            "kpiAverageEvent",
            Dashboard.data.events
                .averages.average || 0
        );

    }


    /*
     * MISSION TRIP KPIs
     *
     * These come from report.gs:
     *
     * totalTrips
     * uniquePeople
     * recurringPeople
     * totalDeployments
     */

    const m =
        Dashboard.data.missionTrips || {};


    setText(
        "kpiMissionTrips",
        m.totalTrips || 0
    );


    setText(
        "kpiMissionUnique",
        m.uniquePeople || 0
    );


    setText(
        "kpiTrippers",
        m.totalDeployments || 0
    );


    setText(
        "kpiMissionRecurring",
        m.recurringPeople || 0
    );


    /*
     * Legacy ID
     */

    const averageTeam =
        m.totalTrips
            ? Math.round(
                (
                    m.totalDeployments || 0
                ) /
                m.totalTrips
            )
            : 0;


    setText(
        "kpiAvgTeam",
        averageTeam
    );

}


/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */

function renderExecutiveSummary() {

    const executive =
        Dashboard.data.executive || {};


    setText(
        "executiveTitle",
        executive.title || ""
    );


    const overview =
        executive.overview || [];


    renderTextList(
        "executiveOverview",
        overview
    );


    const highlights =
        executive.highlights || {};


    setText(
        "executiveTopChurch",
        highlights.topChurch || "-"
    );


    setText(
        "executiveTopEvent",
        highlights.topEvent || "-"
    );


    setText(
        "executiveTopReferral",
        highlights.topReferral || "-"
    );


    setText(
        "executiveNewestEvent",
        highlights.newestEvent || "-"
    );


    setText(
        "executiveMissionHealth",
        highlights.missionHealth || "-"
    );

}


/* ==========================================================
   AGM SUMMARY
========================================================== */

function renderAGMSummary() {

    const agm =
        Dashboard.data.agm || {};


    const eventParticipation =
        agm.eventParticipation || {};


    const missionTrips =
        agm.missionTrips || {};


    setText(
        "agmEvents",
        eventParticipation.numberOfEvents || 0
    );


    setText(
        "agmUniquePeople",
        eventParticipation.numberOfUniquePeople || 0
    );


    setText(
        "agmAttended",
        eventParticipation.numberOfPeopleAttended || 0
    );


    setText(
        "agmRecurring",
        eventParticipation.numberOfRecurringPeople || 0
    );


    setText(
        "agmMissionTrips",
        missionTrips.numberOfMissionTrips || 0
    );


    setText(
        "agmMissionPeople",
        missionTrips.numberOfUniquePeople || 0
    );


    setText(
        "agmPeopleGoing",
        missionTrips.numberOfPeopleGoing || 0
    );


    setText(
        "agmRecurringMissionaries",
        missionTrips.numberOfRecurringPeople || 0
    );


    const summary =
        agm.summary || {};


    setText(
        "agmEventSummary",
        summary.events || ""
    );


    setText(
        "agmMissionSummary",
        summary.missionTrips || ""
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


    const missionTrips =
        Dashboard.data.missionTrips || {};


    const trips =
        missionTrips.tripSummary ||
        (
            Dashboard.data.tables &&
            Dashboard.data.tables.missionTrips
        ) ||
        [];


    if (
        !Array.isArray(trips) ||
        trips.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No mission trips found.
                </td>
            </tr>
        `;

        return;

    }


    trips.forEach(
        trip => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${escapeHTML(
                        trip.tripCode ||
                        trip.tripID ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trip.location ||
                        "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        trip.startDate
                    )}
                </td>

                <td>
                    ${trip.participants || 0}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


/* ==========================================================
   TOP CONTRIBUTORS
========================================================== */

function renderTopContributors() {

    renderTopParticipants();

    renderTopMissionaries();

    renderTopChurches();

    renderTopEvents();

}


/* ==========================================================
   TOP PARTICIPANTS
========================================================== */

function renderTopParticipants() {

    const tbody =
        document.getElementById(
            "topParticipants"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const people =
        Array.isArray(
            Dashboard.data.topParticipants
        )
            ? Dashboard.data.topParticipants
            : [];


    people.forEach(
        (person, index) => {

            const tr =
                document.createElement("tr");


            tr.style.cursor =
                "pointer";


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        person.name ||
                        "-"
                    )}
                </td>

                <td>
                    ${person.events || 0}
                </td>

                <td>
                    ${person.missionTrips || 0}
                </td>

                <td>
                    ${person.totalEngagement || 0}
                </td>

            `;


            tr.onclick = () => {

                openMissionalJourney(
                    person.personKey ||
                    buildPersonKey(
                        person
                    )
                );

            };


            tbody.appendChild(tr);

        }
    );

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
        Array.isArray(
            Dashboard.data.tables.topMissionaries
        )
            ? Dashboard.data.tables.topMissionaries
            : [];


    people.slice(0, 5)
        .forEach(
            (person, index) => {

                const tr =
                    document.createElement("tr");


                tr.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(
                            person.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${person.events || 0}
                    </td>

                `;


                /*
                 * topMissionaries does not contain
                 * mobile/personKey in report.gs.
                 *
                 * Therefore do not attempt to open
                 * a journey from this table unless
                 * the HTML/backend data is extended.
                 */

                tbody.appendChild(tr);

            }
        );

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
        Array.isArray(
            Dashboard.data.tables.topChurches
        )
            ? Dashboard.data.tables.topChurches
            : [];


    churches.forEach(
        church => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${escapeHTML(
                        church.church ||
                        "-"
                    )}
                </td>

                <td>
                    ${church.participants || 0}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

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
        Array.isArray(
            Dashboard.data.tables.topEvents
        )
            ? Dashboard.data.tables.topEvents
            : [];


    events.forEach(
        event => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${escapeHTML(
                        event.event ||
                        "-"
                    )}
                </td>

                <td>
                    ${event.participants || 0}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


/* ==========================================================
   PARTICIPANT JOURNEY SUMMARY
========================================================== */

function renderParticipantJourneySummary() {

    const container =
        document.getElementById(
            "missionalJourneyPeople"
        );


    if (!container)
        return;


    container.innerHTML = "";


    const people =
        Array.isArray(
            Dashboard.data.topParticipants
        )
            ? Dashboard.data.topParticipants
            : [];


    if (
        people.length === 0
    ) {

        container.innerHTML =
            "<p>No participants found.</p>";

        return;

    }


    people.slice(0, 5)
        .forEach(
            (person, index) => {

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
                            person.name ||
                            "Unknown"
                        )}
                    </div>

                    <div class="journeyPersonChurch">
                        ${escapeHTML(
                            person.church ||
                            "-"
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
                        person.personKey ||
                        buildPersonKey(
                            person
                        )
                    );

                };


                container.appendChild(card);

            }
        );

}


/* ==========================================================
   OPEN MISSIONAL JOURNEY
========================================================== */

async function openMissionalJourney(
    personKey
) {

    if (!personKey) {

        alert(
            "This participant does not have a valid identity recorded."
        );

        return;

    }


    /*
     * report.gs expects:
     *
     * MOBILE:XXXXXXXX
     * EMAIL:xxxx
     * NAME:xxxx
     */

    personKey =
        normalisePersonKey(
            personKey
        );


    try {

        showLoading();


        const result =
            await API.post(
                "getMissionalJourney",
                {
                    personKey:
                        personKey
                }
            );


        if (!result) {

            throw new Error(
                "No response received."
            );

        }


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

        console.error(
            "MISSIONAL JOURNEY ERROR:",
            err
        );

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
   BUILD PERSON KEY
========================================================== */

function buildPersonKey(
    person
) {

    if (!person)
        return "";


    if (person.personKey)
        return person.personKey;


    if (person.mobile) {

        const mobile =
            cleanPhone(
                person.mobile
            );

        if (mobile)
            return (
                "MOBILE:" +
                mobile
            );

    }


    if (person.email) {

        return (
            "EMAIL:" +
            String(
                person.email
            )
            .trim()
            .toLowerCase()
        );

    }


    if (person.name) {

        return (
            "NAME:" +
            String(
                person.name
            )
            .trim()
            .toLowerCase()
        );

    }


    return "";

}


/* ==========================================================
   NORMALISE PERSON KEY
========================================================== */

function normalisePersonKey(
    identifier
) {

    let key =
        String(
            identifier || ""
        )
        .trim();


    if (!key)
        return "";


    /*
     * Already formatted
     */

    if (
        key.startsWith(
            "MOBILE:"
        ) ||
        key.startsWith(
            "EMAIL:"
        ) ||
        key.startsWith(
            "NAME:"
        )
    ) {

        return key;

    }


    /*
     * Phone
     */

    const phone =
        cleanPhone(
            key
        );


    if (
        phone &&
        phone.length >= 6
    ) {

        return (
            "MOBILE:" +
            phone
        );

    }


    /*
     * Email
     */

    if (
        key.includes("@")
    ) {

        return (
            "EMAIL:" +
            key.toLowerCase()
        );

    }


    /*
     * Name
     */

    return (
        "NAME:" +
        key.toLowerCase()
    );

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


    if (
        !journey ||
        journey.found === false
    ) {

        title.textContent =
            "Missional Journey";


        body.innerHTML = `
            <p>
                No journey records found
                for this participant.
            </p>
        `;


        openDetailsModal();


        return;

    }


    const person =
        journey.person || {};


    const summary =
        journey.summary || {};


    title.textContent =
        person.name ||
        "Missional Journey";


    let html = `

        <div class="missionalJourney">

            <div class="journeyHeader">

                <h3>
                    ${escapeHTML(
                        person.name ||
                        "Unknown"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        person.church ||
                        "-"
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        person.mobile ||
                        person.email ||
                        "-"
                    )}
                </p>

            </div>


            <div class="journeySummary">

                <div>

                    <strong>
                        ${summary.events || 0}
                    </strong>

                    <span>
                        Mission Events
                    </span>

                </div>


                <div>

                    <strong>
                        ${summary.attended || 0}
                    </strong>

                    <span>
                        Events Attended
                    </span>

                </div>


                <div>

                    <strong>
                        ${summary.missionTrips || 0}
                    </strong>

                    <span>
                        Mission Trips
                    </span>

                </div>


                <div>

                    <strong>
                        ${summary.totalJourneyEntries || 0}
                    </strong>

                    <span>
                        Journey Entries
                    </span>

                </div>

            </div>


            <div class="journeyTimeline">

                <h3>
                    Missional Journey
                </h3>

    `;


    const timeline =
        Array.isArray(
            journey.journey
        )
            ? journey.journey
            : [];


    if (
        timeline.length === 0
    ) {

        html += `

            <p>
                No journey records found.
            </p>

        `;

    }

    else {

        timeline.forEach(
            item => {

                html += `

                    <div class="journeyTimelineItem">

                        <div class="journeyDate">

                            ${escapeHTML(
                                item.dateText ||
                                formatDate(
                                    item.date
                                )
                            )}

                        </div>


                        <div class="journeyMarker">
                            ●
                        </div>


                        <div class="journeyContent">

                            <div class="journeyType">

                                ${escapeHTML(
                                    item.type ||
                                    ""
                                )}

                            </div>


                            <h4>

                                ${escapeHTML(
                                    item.title ||
                                    "-"
                                )}

                            </h4>


                            ${
                                item.eventType
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                item.eventType
                                            )}
                                        </p>
                                      `
                                    : ""
                            }


                            ${
                                item.description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                item.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }


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

            }
        );

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


    openDetailsModal();


    Dashboard.currentJourney =
        journey;

}


/* ==========================================================
   PRINT MISSIONAL JOURNEY
========================================================== */

function printMissionalJourney() {

    if (
        !Dashboard.currentJourney
    ) {

        alert(
            "No missional journey selected."
        );

        return;

    }


    const journey =
        Dashboard.currentJourney;


    const person =
        journey.person || {};


    const summary =
        journey.summary || {};


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
                    person.name ||
                    ""
                )}
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:
                        40px;

                    color:
                        #222;

                }

                h1 {

                    margin-bottom:
                        5px;

                }

                .meta {

                    color:
                        #666;

                    margin-bottom:
                        30px;

                }

                .summary {

                    display:
                        flex;

                    gap:
                        30px;

                    margin-bottom:
                        30px;

                }

                .summaryBox {

                    border:
                        1px solid #ddd;

                    padding:
                        15px;

                }

                .summaryBox strong {

                    display:
                        block;

                    font-size:
                        24px;

                }

                .timelineItem {

                    display:
                        flex;

                    gap:
                        20px;

                    margin-bottom:
                        20px;

                    padding-bottom:
                        20px;

                    border-bottom:
                        1px solid #eee;

                }

                .date {

                    width:
                        100px;

                    font-weight:
                        bold;

                }

                .type {

                    font-size:
                        12px;

                    text-transform:
                        uppercase;

                    color:
                        #777;

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
                        person.name ||
                        ""
                    )}
                </strong>

                <br>

                ${escapeHTML(
                    person.church ||
                    "-"
                )}

                <br>

                ${escapeHTML(
                    person.mobile ||
                    person.email ||
                    "-"
                )}

            </div>


            <div class="summary">

                <div class="summaryBox">

                    <strong>
                        ${summary.events || 0}
                    </strong>

                    Mission Events

                </div>


                <div class="summaryBox">

                    <strong>
                        ${summary.attended || 0}
                    </strong>

                    Events Attended

                </div>


                <div class="summaryBox">

                    <strong>
                        ${summary.missionTrips || 0}
                    </strong>

                    Mission Trips

                </div>

            </div>


            <h2>
                Journey Timeline
            </h2>

    `;


    (
        journey.journey || []
    )
    .forEach(
        item => {

            html += `

                <div class="timelineItem">

                    <div class="date">

                        ${escapeHTML(
                            item.dateText ||
                            formatDate(
                                item.date
                            )
                        )}

                    </div>


                    <div>

                        <div class="type">

                            ${escapeHTML(
                                item.type ||
                                ""
                            )}

                        </div>


                        <strong>

                            ${escapeHTML(
                                item.title ||
                                "-"
                            )}

                        </strong>


                        ${
                            item.eventType
                                ? `
                                    <div>
                                        ${escapeHTML(
                                            item.eventType
                                        )}
                                    </div>
                                  `
                                : ""
                        }


                        ${
                            item.description
                                ? `
                                    <div>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                    </div>
                                  `
                                : ""
                        }


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

        }
    );


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
   EVENT SUMMARY TABLE
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
        Array.isArray(
            Dashboard.data.tables.eventSummary
        )
            ? Dashboard.data.tables.eventSummary
            : [];


    if (
        events.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10">
                    No event records found.
                </td>
            </tr>
        `;

        return;

    }


    events.forEach(
        event => {

            const tr =
                document.createElement("tr");


            tr.style.cursor =
                "pointer";


            tr.innerHTML = `

                <td>
                    ${formatDate(
                        event.date
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        event.event ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        event.type ||
                        "-"
                    )}
                </td>

                <td>
                    ${event.registered || 0}
                </td>

                <td>
                    ${event.attended || 0}
                </td>

                <td>
                    ${event.attendance || 0}%
                </td>

                <td>
                    ${event.firstTimers || 0}
                </td>

                <td>
                    ${event.repeat || 0}
                </td>

                <td>
                    ${event.churches || 0}
                </td>

                <td>
                    ${escapeHTML(
                        event.status ||
                        "-"
                    )}
                </td>

            `;


            tr.onclick = () => {

                openEventDetails(
                    event.event
                );

            };


            tbody.appendChild(tr);

        }
    );

}


/* ==========================================================
   PARTICIPANT DIRECTORY
========================================================== */

function renderParticipantDirectory(
    peopleOverride
) {

    const tbody =
        document.getElementById(
            "participantSummaryTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const people =
        peopleOverride ||
        (
            Dashboard.data.tables &&
            Array.isArray(
                Dashboard.data.tables.participantSummary
            )
                ? Dashboard.data.tables.participantSummary
                : []
        );


    if (
        people.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No participants found.
                </td>
            </tr>
        `;

        return;

    }


    people.forEach(
        person => {

            const tr =
                document.createElement("tr");


            tr.style.cursor =
                "pointer";


            tr.innerHTML = `

                <td>

                    ${escapeHTML(
                        person.name ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        person.church ||
                        "-"
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

                    ${escapeHTML(
                        person.leadership ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        person.status ||
                        "-"
                    )}

                </td>

            `;


            tr.onclick = () => {

                openMissionalJourney(
                    person.personKey ||
                    buildPersonKey(
                        person
                    )
                );

            };


            tbody.appendChild(tr);

        }
    );

}


/* ==========================================================
   PARTICIPANT SEARCH
========================================================== */

async function searchParticipantDirectory(
    searchTerm
) {

    const query =
        String(
            searchTerm || ""
        )
        .trim();


    if (!query) {

        renderParticipantDirectory();

        return;

    }


    try {

        const result =
            await API.post(
                "searchParticipant",
                {
                    searchTerm:
                        query
                }
            );


        if (
            !result ||
            !result.success
        ) {

            return;

        }


        renderParticipantDirectory(
            result.data || []
        );

    }

    catch (err) {

        console.error(
            "PARTICIPANT SEARCH ERROR:",
            err
        );

    }

}


/* ==========================================================
   EVENT DETAILS
========================================================== */

async function openEventDetails(
    eventName
) {

    if (!eventName)
        return;


    try {

        showLoading();


        const result =
            await API.post(
                "getEventDetails",
                {
                    eventName:
                        eventName
                }
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to load event details."
            );

        }


        openModal(
            eventName,
            result.data
        );

    }

    catch (err) {

        console.error(
            "EVENT DETAILS ERROR:",
            err
        );

        alert(
            err.message ||
            "Unable to load event details."
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


    if (
        !modalTitle ||
        !modalBody
    )
        return;


    modalTitle.textContent =
        title || "";


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


    openDetailsModal();

}


/* ==========================================================
   OPEN MODAL
========================================================== */

function openDetailsModal() {

    document
        .getElementById(
            "detailsModal"
        )
        ?.classList
        .remove(
            "hidden"
        );

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
        .add(
            "hidden"
        );

}


/* ==========================================================
   FILTER POPULATION
========================================================== */

function populateFilters() {

    /*
     * report.gs does NOT return filter arrays.
     *
     * Therefore we preserve existing HTML
     * options instead of destroying them.
     */


    const yearFilter =
        document.getElementById(
            "yearFilter"
        );


    if (
        yearFilter &&
        Dashboard.filters.year
    ) {

        yearFilter.value =
            Dashboard.filters.year;

    }


    const startFilter =
        document.getElementById(
            "startDateFilter"
        );


    if (
        startFilter &&
        Dashboard.filters.startDate
    ) {

        startFilter.value =
            Dashboard.filters.startDate;

    }


    const endFilter =
        document.getElementById(
            "endDateFilter"
        );


    if (
        endFilter &&
        Dashboard.filters.endDate
    ) {

        endFilter.value =
            Dashboard.filters.endDate;

    }

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

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas)
        return;


    if (!dataset)
        return;


    if (
        Dashboard.charts[
            canvasId
        ]
    ) {

        Dashboard.charts[
            canvasId
        ].destroy();

        delete Dashboard.charts[
            canvasId
        ];

    }


    const chartData =
        buildChartData(
            dataset,
            options
        );


    if (!chartData)
        return;


    Dashboard.charts[
        canvasId
    ] =
        new Chart(
            canvas,
            {

                type:
                    chartType,

                data:
                    chartData,

                options:
                    buildChartOptions(
                        chartType,
                        options
                    )

            }
        );

}


/* ==========================================================
   BUILD CHART DATA
========================================================== */

function buildChartData(
    dataset,
    options = {}
) {

    /*
     * Standard backend format:
     *
     * {
     *   labels: [],
     *   values: []
     * }
     */


    if (
        Array.isArray(
            dataset.labels
        ) &&
        Array.isArray(
            dataset.values
        )
    ) {

        return {

            labels:
                dataset.labels,

            datasets: [

                {

                    label:
                        options.label ||
                        "",

                    data:
                        dataset.values,

                    borderWidth:
                        1,

                    fill:
                        false

                }

            ]

        };

    }


    /*
     * Church growth is returned by report.gs
     * as:
     *
     * {
     *   "2026-01": {
     *      "Church A": 4,
     *      "Church B": 2
     *   }
     * }
     */


    if (
        isPlainObject(
            dataset
        )
    ) {

        return buildObjectChartData(
            dataset
        );

    }


    return null;

}


/* ==========================================================
   OBJECT → MULTI DATASET CHART
========================================================== */

function buildObjectChartData(
    object
) {

    const labels =
        Object.keys(
            object
        ).sort();


    const series =
        new Set();


    labels.forEach(
        label => {

            Object.keys(
                object[label] || {}
            )
            .forEach(
                key =>
                    series.add(key)
            );

        }
    );


    const datasets =
        Array.from(
            series
        )
        .map(
            seriesName => ({

                label:
                    seriesName,

                data:
                    labels.map(
                        label =>
                            (
                                object[label] || {}
                            )[seriesName] || 0
                    ),

                borderWidth:
                    1,

                fill:
                    false

            })
        );


    return {

        labels,

        datasets

    };

}


/* ==========================================================
   CHART OPTIONS
========================================================== */

function buildChartOptions(
    chartType,
    options = {}
) {

    const isCircular =
        chartType === "pie" ||
        chartType === "doughnut";


    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        plugins: {

            legend: {

                display:
                    options.legend !== undefined
                        ? options.legend
                        : isCircular

            }

        },

        scales:
            isCircular
                ? {}
                : {

                    y: {

                        beginAtZero:
                            true

                    }

                }

    };

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


    /*
     * Referral
     */

    renderChart(
        "referralChart",
        "bar",
        p.referralDistribution
    );


    /*
     * Attendance
     */

    renderChart(
        "participantAttendanceChart",
        "doughnut",
        p.attendanceDistribution
    );


    /*
     * Monthly trend
     */

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


    /*
     * Participation
     */

    renderChart(
        "topChurchChart",
        "bar",
        c.participation
    );


    /*
     * Attendance
     */

    renderChart(
        "churchAttendanceChart",
        "bar",
        c.attendance
    );


    /*
     * Retention
     */

    renderChart(
        "churchRetentionChart",
        "bar",
        c.retention
    );


    /*
     * Growth
     *
     * Backend returns object-by-month.
     */

    renderChart(
        "churchGrowthChart",
        "line",
        c.growth
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
                x =>
                    formatDate(
                        x.date
                    )
            ),

        values:
            list.map(
                x =>
                    x.participants || 0
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
                p =>
                    p.name || "-"
            ),

        values:
            people.map(
                p =>
                    p[field] || 0
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

                type:
                    "bar",

                data: {

                    labels: [
                        "Average"
                    ],

                    datasets: [

                        {

                            data: [
                                avg || 0
                            ],

                            borderWidth:
                                1

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true

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
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML =
            "<p>No insights available.</p>";

        return;

    }


    items.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "insightItem";


            div.textContent =
                "• " +
                String(
                    item
                );


            container.appendChild(
                div
            );

        }
    );

}


/* ==========================================================
   GENERIC TEXT LIST
========================================================== */

function renderTextList(
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
        !Array.isArray(items) ||
        items.length === 0
    )
        return;


    items.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                String(
                    item
                );


            container.appendChild(
                div
            );

        }
    );

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

        const parsed =
            new Date(
                date
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return String(
                date
            );

        }


        return parsed
            .toLocaleDateString(
                "en-SG",
                {

                    year:
                        "numeric",

                    month:
                        "short",

                    day:
                        "numeric"

                }
            );

    }

    catch (err) {

        return String(
            date
        );

    }

}


/* ==========================================================
   CLEAN PHONE
========================================================== */

function cleanPhone(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /\D/g,
        ""
    );

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


    if (el) {

        el.textContent =
            value ?? 0;

    }

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
   PLAIN OBJECT CHECK
========================================================== */

function isPlainObject(
    value
) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
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
   DASHBOARD ERROR
========================================================== */

function showDashboardError(
    message
) {

    console.error(
        message
    );


    const errorElement =
        document.getElementById(
            "dashboardError"
        );


    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.classList.remove(
            "hidden"
        );

        return;

    }


    alert(
        message
    );

}


/* ==========================================================
   BACK BUTTON
========================================================== */

function goBack() {

    history.back();

}


/* ==========================================================
   EXPORT DASHBOARD
========================================================== */

async function exportDashboard() {

    try {

        showLoading();


        const result =
            await API.post(
                "exportDashboard",
                Dashboard.filters
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to export dashboard."
            );

        }


        /*
         * At this stage the backend returns
         * the dashboard data.
         *
         * Browser-side export can be built
         * on top of this response.
         */

        console.log(
            "Dashboard export data:",
            result.data
        );


        alert(
            "Dashboard data prepared for export."
        );

    }

    catch (err) {

        console.error(
            "EXPORT ERROR:",
            err
        );

        alert(
            err.message ||
            "Unable to export dashboard."
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   EXPORT EXCEL
========================================================== */

function exportExcel() {

    exportDashboard();

}


/* ==========================================================
   EXPORT CSV
========================================================== */

function exportCSV() {

    exportDashboard();

}


/* ==========================================================
   EXPORT EVENT TABLE
========================================================== */

function exportEventTable() {

    const rows =
        Dashboard.data &&
        Dashboard.data.tables &&
        Dashboard.data.tables.eventSummary;


    if (!Array.isArray(rows)) {

        alert(
            "No event data available."
        );

        return;

    }


    downloadCSV(
        "mission-events.csv",
        rows
    );

}


/* ==========================================================
   EXPORT PARTICIPANTS
========================================================== */

function exportParticipants() {

    const rows =
        Dashboard.data &&
        Dashboard.data.tables &&
        Dashboard.data.tables.participantSummary;


    if (!Array.isArray(rows)) {

        alert(
            "No participant data available."
        );

        return;

    }


    downloadCSV(
        "mission-participants.csv",
        rows
    );

}


/* ==========================================================
   CSV DOWNLOAD
========================================================== */

function downloadCSV(
    filename,
    rows
) {

    if (
        !Array.isArray(rows) ||
        rows.length === 0
    )
        return;


    const headers =
        Object.keys(
            rows[0]
        );


    const csv = [

        headers.join(","),

        ...rows.map(
            row =>
                headers
                    .map(
                        header =>
                            csvEscape(
                                row[header]
                            )
                    )
                    .join(",")
        )

    ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* ==========================================================
   CSV ESCAPE
========================================================== */

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    return (
        '"' +
        text.replace(
            /"/g,
            '""'
        ) +
        '"'
    );

}
