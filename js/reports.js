/* ==========================================================
   Missions Intelligence Dashboard
   reports.js
   Compatible with the current REPORTS.GS API
========================================================== */

console.log("Missions Intelligence Dashboard");

const Dashboard = {
    data: null,
    missionData: null,
    charts: {},
    filters: {
        year: "",
        startDate: "",
        endDate: ""
    },
    initialised: false,
    participantSearchTimer: null
};

document.addEventListener("DOMContentLoaded", initialiseDashboard);

async function initialiseDashboard() {
    try {
        showLoading();
        await loadDashboard();
        renderDashboard();
        initialiseFilters();
        initialiseLegacyFilters();
        updateLastRefresh();
        Dashboard.initialised = true;
    } catch (err) {
        console.error("DASHBOARD INITIALISATION ERROR:", err);
        alert(err.message || "Unable to load dashboard.");
    } finally {
        hideLoading();
    }
}

async function loadDashboard() {
    const result = await API.post("getMissionDashboard", Dashboard.filters);

    if (!result || !result.success) {
        throw new Error(result?.message || "Unable to load mission dashboard.");
    }

    /*
       Current REPORTS.GS response:
       result.data = {
           generatedAt,
           filters,
           totalRows,
           dashboard
       }
    */
    Dashboard.data = result.data?.dashboard || null;
    Dashboard.missionData = Dashboard.data?.missionTrips || null;
    Dashboard.serverFilters = result.data?.filters || {};

    if (!Dashboard.data) {
        throw new Error("Mission dashboard data was not returned by REPORTS.GS.");
    }
}

function renderDashboard() {
    if (!Dashboard.data) return;

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
    renderParticipantJourneySummary();
}

async function refreshDashboard() {
    await applyFilters();
}

function showLoading() {
    document.getElementById("loadingOverlay")?.classList.remove("hidden");
}

function hideLoading() {
    document.getElementById("loadingOverlay")?.classList.add("hidden");
}

function updateLastRefresh() {
    const el = document.getElementById("lastRefresh");
    if (el) el.textContent = new Date().toLocaleString("en-SG");
}

function goBack() {
    history.back();
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "-";
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

/* ==========================================================
   Missions Intelligence Dashboard
   reports.js
   Part 2 - Dashboard Rendering & Data Binding
========================================================== */


/* ==========================================================
   DASHBOARD DATA ACCESS
========================================================== */

function getDashboardData() {

    if (!Dashboard.data) {

        throw new Error(
            "Dashboard data has not been loaded."
        );

    }

    return Dashboard.data.dashboard ||
           Dashboard.data;

}


/* ==========================================================
   RENDER COMPLETE DASHBOARD
========================================================== */

function renderDashboard() {

    const dashboard =
        getDashboardData();

    console.log(
        "Rendering dashboard:",
        dashboard
    );


    /* ------------------------------------------------------
       TOP LINE KPIs
    ------------------------------------------------------ */

    renderKPIs(
        dashboard.kpis
    );


    /* ------------------------------------------------------
       EXECUTIVE SUMMARY
    ------------------------------------------------------ */

    renderExecutiveSummary(
        dashboard.executive
    );


    /* ------------------------------------------------------
       MISSION INSIGHTS
    ------------------------------------------------------ */

    renderMissionInsights(
        dashboard.missionInsights
    );


    /* ------------------------------------------------------
       PARTICIPANT SECTION
    ------------------------------------------------------ */

    renderParticipantAnalytics(
        dashboard.participants
    );


    /* ------------------------------------------------------
       CHURCH SECTION
    ------------------------------------------------------ */

    renderChurchAnalytics(
        dashboard.churches
    );


    /* ------------------------------------------------------
       EVENT SECTION
    ------------------------------------------------------ */

    renderEventAnalytics(
        dashboard.events
    );


    /* ------------------------------------------------------
       LEADERSHIP SECTION
    ------------------------------------------------------ */

    renderLeadershipAnalytics(
        dashboard.leadership
    );


    /* ------------------------------------------------------
       TABLES
    ------------------------------------------------------ */

    renderTables(
        dashboard.tables
    );


    /* ------------------------------------------------------
       MISSION JOURNEY
    ------------------------------------------------------ */

    renderMissionJourney(
        dashboard
    );


    /* ------------------------------------------------------
       FILTERS
    ------------------------------------------------------ */

    initialiseDashboardFilters(
        dashboard
    );

}


/* ==========================================================
   KPI RENDERING
========================================================== */

function renderKPIs(kpis) {

    if (!kpis)
        return;


    setText(
        "kpiRegistrations",
        formatNumber(
            kpis.registrations
        )
    );


    setText(
        "kpiParticipants",
        formatNumber(
            kpis.uniqueParticipants
        )
    );


    setText(
        "kpiEvents",
        formatNumber(
            kpis.totalEvents
        )
    );


    setText(
        "kpiChurches",
        formatNumber(
            kpis.totalChurches
        )
    );


    setText(
        "kpiAttendance",
        `${kpis.attendanceRate || 0}%`
    );


    setText(
        "kpiRepeat",
        formatNumber(
            kpis.repeatParticipants
        )
    );


    setText(
        "kpiFirstTimers",
        formatNumber(
            kpis.firstTimers
        )
    );


    setText(
        "kpiGrowth",
        formatGrowth(
            kpis.growthRate
        )
    );


    /* ------------------------------------------------------
       MISSION HEALTH
    ------------------------------------------------------ */

    setText(
        "missionHealthScore",
        kpis.missionHealthScore ?? 0
    );


    setText(
        "missionHealthStatus",
        kpis.missionHealthStatus ||
        "Unknown"
    );


    setText(
        "missionHealthDescription",
        kpis.missionHealthDescription ||
        ""
    );


    updateMissionHealthClass(
        kpis.missionHealthStatus
    );

}


/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */

function renderExecutiveSummary(executive) {

    if (!executive)
        return;


    setText(
        "executiveTitle",
        executive.title ||
        ""
    );


    const overview =
        executive.overview || [];


    renderList(
        "executiveOverview",
        overview
    );


    const highlights =
        executive.highlights || {};


    setText(
        "highlightTopChurch",
        highlights.topChurch ||
        "N/A"
    );


    setText(
        "highlightTopEvent",
        highlights.topEvent ||
        "N/A"
    );


    setText(
        "highlightTopReferral",
        highlights.topReferral ||
        "N/A"
    );


    setText(
        "highlightLatestEvent",
        highlights.newestEvent ||
        "N/A"
    );


    setText(
        "highlightMissionHealth",
        highlights.missionHealth ||
        "N/A"
    );

}


/* ==========================================================
   MISSION INSIGHTS
========================================================== */

function renderMissionInsights(insights) {

    if (!insights)
        return;


    renderInsightGroup(
        "insightCelebrate",
        insights.celebrate
    );


    renderInsightGroup(
        "insightWarning",
        insights.warning
    );


    renderInsightGroup(
        "insightRecommendation",
        insights.recommendation
    );


    renderInsightGroup(
        "insightRisk",
        insights.risk
    );

}


/* ==========================================================
   INSIGHT GROUP
========================================================== */

function renderInsightGroup(
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


    if (!items || !items.length) {

        container.innerHTML =
            `<div class="empty-state">
                No insights available.
             </div>`;

        return;

    }


    items.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "insight-item";

        div.textContent =
            item;

        container.appendChild(
            div
        );

    });

}


/* ==========================================================
   PARTICIPANT ANALYTICS
========================================================== */

function renderParticipantAnalytics(
    participants
) {

    if (!participants)
        return;


    renderChart(
        "firstTimeReturningChart",
        "doughnut",
        participants.firstTimeVsReturning
    );


    renderChart(
        "ageDistributionChart",
        "bar",
        participants.ageDistribution
    );


    renderChart(
        "churchDistributionChart",
        "bar",
        participants.churchDistribution
    );


    renderChart(
        "referralDistributionChart",
        "doughnut",
        participants.referralDistribution
    );


    renderChart(
        "attendanceDistributionChart",
        "doughnut",
        participants.attendanceDistribution
    );


    renderParticipantDirectory(
        participants
    );

}


/* ==========================================================
   PARTICIPANT DIRECTORY
========================================================== */

function renderParticipantDirectory(
    participants
) {

    const table =
        document.getElementById(
            "participantTableBody"
        );

    if (!table)
        return;


    table.innerHTML = "";


    const rows =
        Dashboard.filteredParticipants ||
        Dashboard.data.dashboard
            .tables
            .participantSummary ||
        [];


    rows.forEach(person => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                <button
                    class="participant-link"
                    type="button"
                    data-email="${escapeHtml(
                        person.email || ""
                    )}"
                >
                    ${escapeHtml(
                        person.name || "Unknown"
                    )}
                </button>
            </td>

            <td>
                ${escapeHtml(
                    person.church || "Unknown"
                )}
            </td>

            <td>
                ${person.age || ""}
            </td>

            <td>
                ${person.events || 0}
            </td>

            <td>
                ${person.attendanceRate || 0}%
            </td>

            <td>
                ${escapeHtml(
                    person.leadership || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    person.status || ""
                )}
            </td>

        `;


        table.appendChild(tr);

    });


    bindParticipantLinks();

}


/* ==========================================================
   PARTICIPANT SEARCH
========================================================== */

function searchParticipants(searchTerm) {

    const dashboard =
        getDashboardData();


    const participants =
        dashboard.tables
            ?.participantSummary || [];


    const search =
        String(
            searchTerm || ""
        )
        .trim()
        .toLowerCase();


    if (!search) {

        Dashboard.filteredParticipants =
            participants;

    } else {

        Dashboard.filteredParticipants =
            participants.filter(person => {

                return (

                    String(
                        person.name || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        person.church || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        person.email || ""
                    )
                    .toLowerCase()
                    .includes(search)

                );

            });

    }


    renderParticipantDirectory(
        dashboard.participants
    );

}


/* ==========================================================
   PARTICIPANT SEARCH EVENT
========================================================== */

function bindParticipantSearch() {

    const input =
        document.getElementById(
            "participantSearch"
        );

    if (!input)
        return;


    input.addEventListener(
        "input",
        debounce(
            function () {

                searchParticipants(
                    this.value
                );

            },
            200
        )
    );

}


/* ==========================================================
   PARTICIPANT DETAIL
========================================================== */

async function openParticipantDetails(
    email
) {

    if (!email)
        return;


    try {

        const response =
            await apiPost(
                "getParticipantDetails",
                {
                    email: email
                }
            );


        if (
            !response ||
            response.success === false
        ) {

            throw new Error(
                response?.message ||
                "Unable to load participant."
            );

        }


        renderParticipantJourney(
            response.data ||
            response
        );


        openModal(
            "participantJourneyModal"
        );


    } catch (error) {

        console.error(
            "Participant detail error:",
            error
        );

        showError(
            "Unable to load participant details."
        );

    }

}


/* ==========================================================
   PARTICIPANT LINKS
========================================================== */

function bindParticipantLinks() {

    document
        .querySelectorAll(
            ".participant-link"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    openParticipantDetails(
                        this.dataset.email
                    );

                }
            );

        });

}


/* ==========================================================
   PARTICIPANT JOURNEY
========================================================== */

function renderParticipantJourney(
    rows
) {

    const container =
        document.getElementById(
            "participantJourney"
        );

    if (!container)
        return;


    container.innerHTML = "";


    if (!rows || !rows.length) {

        container.innerHTML =
            `<div class="empty-state">
                No mission history found.
             </div>`;

        return;

    }


    const sorted =
        [...rows]
        .sort(
            (a, b) =>
                new Date(
                    a.eventDate || 0
                )
                -
                new Date(
                    b.eventDate || 0
                )
        );


    sorted.forEach(row => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "journey-item";


        const attended =
            row.attendance === true;


        item.innerHTML = `

            <div class="journey-date">
                ${formatDate(
                    row.eventDate
                )}
            </div>

            <div class="journey-content">

                <div class="journey-event">
                    ${escapeHtml(
                        row.eventName ||
                        "Mission Event"
                    )}
                </div>

                <div class="journey-meta">

                    <span>
                        ${escapeHtml(
                            row.eventType ||
                            ""
                        )}
                    </span>

                    <span>
                        ${escapeHtml(
                            row.church ||
                            ""
                        )}
                    </span>

                    <span class="${
                        attended
                            ? "status-attended"
                            : "status-absent"
                    }">

                        ${
                            attended
                                ? "Attended"
                                : "Absent"
                        }

                    </span>

                </div>

            </div>

        `;


        container.appendChild(
            item
        );

    });

}


/* ==========================================================
   MISSION JOURNEY
========================================================== */

function renderMissionJourney(
    dashboard
) {

    const events =
        dashboard.events;


    if (!events)
        return;


    const timeline =
        events.timeline || [];


    renderMissionTimeline(
        timeline
    );


    renderEventJourneyTable(
        dashboard.tables
            ?.eventSummary || []
    );

}


/* ==========================================================
   MISSION TIMELINE
========================================================== */

function renderMissionTimeline(
    timeline
) {

    const container =
        document.getElementById(
            "missionTimeline"
        );

    if (!container)
        return;


    container.innerHTML = "";


    if (!timeline.length) {

        container.innerHTML =
            `<div class="empty-state">
                No mission journey data available.
             </div>`;

        return;

    }


    timeline.forEach(event => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "timeline-item";


        item.innerHTML = `

            <div class="timeline-marker"></div>

            <div class="timeline-content">

                <div class="timeline-date">

                    ${formatDate(
                        event.date
                    )}

                </div>

                <div class="timeline-title">

                    ${escapeHtml(
                        event.event ||
                        event.name ||
                        "Mission Event"
                    )}

                </div>

                <div class="timeline-participants">

                    ${formatNumber(
                        event.participants ||
                        0
                    )}

                    participants

                </div>

            </div>

        `;


        container.appendChild(
            item
        );

    });

}


/* ==========================================================
   EVENT JOURNEY TABLE
========================================================== */

function renderEventJourneyTable(
    events
) {

    const body =
        document.getElementById(
            "eventJourneyTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    events.forEach(event => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${formatDate(
                    event.date
                )}
            </td>

            <td>
                ${escapeHtml(
                    event.event ||
                    ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    event.type ||
                    ""
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
                ${escapeHtml(
                    event.status ||
                    ""
                )}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   CHURCH ANALYTICS
========================================================== */

function renderChurchAnalytics(
    churches
) {

    if (!churches)
        return;


    renderChart(
        "churchParticipationChart",
        "bar",
        churches.participation
    );


    renderChart(
        "churchAttendanceChart",
        "bar",
        churches.attendance
    );


    renderChart(
        "churchRetentionChart",
        "bar",
        churches.retention
    );


    renderChurchHealth(
        churches.health
    );


    renderTopChurches(
        churches.topChurches
    );

}


/* ==========================================================
   CHURCH HEALTH
========================================================== */

function renderChurchHealth(
    health
) {

    const body =
        document.getElementById(
            "churchHealthTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (health || []).forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    item.church || ""
                )}
            </td>

            <td>
                ${item.score || 0}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   TOP CHURCHES
========================================================== */

function renderTopChurches(
    churches
) {

    const body =
        document.getElementById(
            "topChurchesTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (churches || []).forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    item.church || ""
                )}
            </td>

            <td>
                ${formatNumber(
                    item.participants
                )}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   EVENT ANALYTICS
========================================================== */

function renderEventAnalytics(
    events
) {

    if (!events)
        return;


    renderChart(
        "eventPopularityChart",
        "bar",
        events.popularity
    );


    renderChart(
        "eventAttendanceChart",
        "bar",
        events.attendance
    );


    renderChart(
        "eventTypeChart",
        "doughnut",
        events.eventTypes
    );


    renderChart(
        "monthlyTrendChart",
        "line",
        events.monthlyTrend
    );


    setText(
        "averageAttendance",
        events.averages?.average ||
        0
    );


    renderEventEffectiveness(
        events.effectiveness
    );

}


/* ==========================================================
   EVENT EFFECTIVENESS
========================================================== */

function renderEventEffectiveness(
    effectiveness
) {

    const body =
        document.getElementById(
            "eventEffectivenessTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (effectiveness || []).forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    item.event || ""
                )}
            </td>

            <td>
                ${item.score || 0}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   LEADERSHIP ANALYTICS
========================================================== */

function renderLeadershipAnalytics(
    leadership
) {

    if (!leadership)
        return;


    renderChart(
        "leadershipPipelineChart",
        "bar",
        leadership.pipeline
    );


    renderChart(
        "experienceLevelsChart",
        "doughnut",
        leadership.experience
    );


    renderLeaderCandidates(
        leadership.leaderCandidates
    );


    renderRepeatMissionaries(
        leadership.repeatMissionaries
    );


    renderMobilisation(
        leadership.mobilization
    );

}


/* ==========================================================
   LEADER CANDIDATES
========================================================== */

function renderLeaderCandidates(
    candidates
) {

    const body =
        document.getElementById(
            "leaderCandidatesTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (candidates || []).forEach(person => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    person.name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    person.church || ""
                )}
            </td>

            <td>
                ${person.events || 0}
            </td>

            <td>
                ${person.attendanceRate || 0}%
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   REPEAT MISSIONARIES
========================================================== */

function renderRepeatMissionaries(
    people
) {

    const body =
        document.getElementById(
            "repeatMissionariesTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (people || []).forEach(person => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    person.name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    person.church || ""
                )}
            </td>

            <td>
                ${person.events || 0}
            </td>

            <td>
                ${person.attendanceRate || 0}%
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   MOBILISATION
========================================================== */

function renderMobilisation(
    people
) {

    const body =
        document.getElementById(
            "mobilisationTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (people || []).forEach(person => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    person.name || ""
                )}
            </td>

            <td>
                ${person.events || 0}
            </td>

            <td>
                ${person.attendanceRate || 0}%
            </td>

            <td>
                ${person.score || 0}
            </td>

        `;


        body.appendChild(tr);

    });

}

/* ==========================================================
   Missions Intelligence Dashboard
   reports.js
   Part 3 - Tables, Filters, Charts & UI Helpers
========================================================== */


/* ==========================================================
   TABLE RENDERING
========================================================== */

function renderTables(tables) {

    if (!tables)
        return;


    /* ------------------------------------------------------
       EVENT SUMMARY
    ------------------------------------------------------ */

    renderEventSummaryTable(
        tables.eventSummary
    );


    /* ------------------------------------------------------
       PARTICIPANT SUMMARY
    ------------------------------------------------------ */

    Dashboard.filteredParticipants =
        tables.participantSummary || [];

    renderParticipantDirectory(
        Dashboard.data.dashboard.participants
    );


    /* ------------------------------------------------------
       TOP MISSIONARIES
    ------------------------------------------------------ */

    renderTopMissionaries(
        tables.topMissionaries
    );


    /* ------------------------------------------------------
       TOP CHURCHES
    ------------------------------------------------------ */

    renderTopChurches(
        tables.topChurches
    );


    /* ------------------------------------------------------
       TOP EVENTS
    ------------------------------------------------------ */

    renderTopEvents(
        tables.topEvents
    );

}


/* ==========================================================
   EVENT SUMMARY TABLE
========================================================== */

function renderEventSummaryTable(rows) {

    const body =
        document.getElementById(
            "eventSummaryTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (rows || []).forEach(row => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${formatDate(row.date)}
            </td>

            <td>
                ${escapeHtml(
                    row.event || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.type || ""
                )}
            </td>

            <td>
                ${formatNumber(
                    row.registered
                )}
            </td>

            <td>
                ${formatNumber(
                    row.attended
                )}
            </td>

            <td>
                ${row.attendance || 0}%
            </td>

            <td>
                ${formatNumber(
                    row.firstTimers
                )}
            </td>

            <td>
                ${formatNumber(
                    row.repeat
                )}
            </td>

            <td>
                ${formatNumber(
                    row.churches
                )}
            </td>

            <td>
                <span class="
                    status-badge
                    ${getStatusClass(
                        row.status
                    )}
                ">
                    ${escapeHtml(
                        row.status || ""
                    )}
                </span>
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   TOP MISSIONARIES
========================================================== */

function renderTopMissionaries(rows) {

    const body =
        document.getElementById(
            "topMissionariesTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (rows || []).forEach(person => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    person.name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    person.church || ""
                )}
            </td>

            <td>
                ${formatNumber(
                    person.events
                )}
            </td>

            <td>
                ${person.attendance || 0}%
            </td>

            <td>
                ${person.score || 0}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   TOP CHURCHES
========================================================== */

function renderTopChurchesTable(
    rows
) {

    const body =
        document.getElementById(
            "topChurchesTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (rows || []).forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    item.church || ""
                )}
            </td>

            <td>
                ${formatNumber(
                    item.participants
                )}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   TOP EVENTS
========================================================== */

function renderTopEvents(rows) {

    const body =
        document.getElementById(
            "topEventsTableBody"
        );

    if (!body)
        return;


    body.innerHTML = "";


    (rows || []).forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    item.event || ""
                )}
            </td>

            <td>
                ${formatNumber(
                    item.participants
                )}
            </td>

        `;


        body.appendChild(tr);

    });

}


/* ==========================================================
   FILTER INITIALISATION
========================================================== */

function initialiseDashboardFilters(
    dashboard
) {

    console.log(
        "Initialising dashboard filters"
    );


    const tables =
        dashboard.tables || {};


    const participants =
        tables.participantSummary || [];


    /* ------------------------------------------------------
       BUILD FILTER OPTIONS
    ------------------------------------------------------ */

    populateFilter(
        "filterChurch",
        uniqueValues(
            participants,
            "church"
        ),
        "All Churches"
    );


    populateFilter(
        "filterLeadership",
        uniqueValues(
            participants,
            "leadership"
        ),
        "All Leadership Levels"
    );


    populateFilter(
        "filterStatus",
        uniqueValues(
            participants,
            "status"
        ),
        "All Participant Status"
    );


    populateFilter(
        "filterEvent",
        getEventNames(
            tables.eventSummary
        ),
        "All Events"
    );


    /* ------------------------------------------------------
       SEARCH
    ------------------------------------------------------ */

    bindParticipantSearch();


    /* ------------------------------------------------------
       FILTER EVENTS
    ------------------------------------------------------ */

    bindFilter(
        "filterChurch"
    );


    bindFilter(
        "filterLeadership"
    );


    bindFilter(
        "filterStatus"
    );


    bindFilter(
        "filterEvent"
    );


    /* ------------------------------------------------------
       RESET
    ------------------------------------------------------ */

    const reset =
        document.getElementById(
            "resetFilters"
        );


    if (reset) {

        reset.addEventListener(
            "click",
            resetDashboardFilters
        );

    }


    Dashboard.filtersInitialised =
        true;

}


/* ==========================================================
   FILTER BINDING
========================================================== */

function bindFilter(id) {

    const element =
        document.getElementById(id);

    if (!element)
        return;


    element.addEventListener(
        "change",
        applyDashboardFilters
    );

}


/* ==========================================================
   APPLY FILTERS
========================================================== */

function applyDashboardFilters() {

    const dashboard =
        getDashboardData();


    const participants =
        dashboard.tables
            ?.participantSummary || [];


    const church =
        getFilterValue(
            "filterChurch"
        );


    const leadership =
        getFilterValue(
            "filterLeadership"
        );


    const status =
        getFilterValue(
            "filterStatus"
        );


    const event =
        getFilterValue(
            "filterEvent"
        );


    const searchInput =
        document.getElementById(
            "participantSearch"
        );


    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    Dashboard.filteredParticipants =
        participants.filter(
            person => {

                if (
                    church &&
                    person.church !== church
                )
                    return false;


                if (
                    leadership &&
                    person.leadership !== leadership
                )
                    return false;


                if (
                    status &&
                    person.status !== status
                )
                    return false;


                if (event) {

                    /*
                     * ParticipantSummary from report.gs
                     * does not currently contain an event
                     * list.
                     *
                     * Therefore event filtering cannot
                     * be reliably performed here until
                     * participant event history is included
                     * in the backend response.
                     */

                }


                if (search) {

                    const matches =

                        String(
                            person.name || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            person.church || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            person.email || ""
                        )
                        .toLowerCase()
                        .includes(search);


                    if (!matches)
                        return false;

                }


                return true;

            }
        );


    renderParticipantDirectory(
        dashboard.participants
    );


    updateFilterResultCount();

}


/* ==========================================================
   FILTER RESULT COUNT
========================================================== */

function updateFilterResultCount() {

    const count =
        Dashboard.filteredParticipants
            ?.length || 0;


    setText(
        "participantResultCount",
        `${formatNumber(count)} participants`
    );

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetDashboardFilters() {

    const ids = [

        "filterChurch",

        "filterLeadership",

        "filterStatus",

        "filterEvent",

        "participantSearch"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element)
            return;


        if (
            element.tagName ===
            "SELECT"
        ) {

            element.selectedIndex = 0;

        } else {

            element.value = "";

        }

    });


    Dashboard.filteredParticipants =
        Dashboard.data.dashboard
            .tables
            .participantSummary || [];


    renderParticipantDirectory(
        Dashboard.data.dashboard
            .participants
    );


    updateFilterResultCount();

}


/* ==========================================================
   POPULATE FILTER
========================================================== */

function populateFilter(
    elementId,
    values,
    defaultLabel
) {

    const select =
        document.getElementById(
            elementId
        );


    if (!select)
        return;


    select.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";

    defaultOption.textContent =
        defaultLabel;


    select.appendChild(
        defaultOption
    );


    values
        .filter(Boolean)
        .sort(
            (a,b) =>
                String(a)
                .localeCompare(
                    String(b)
                )
        )
        .forEach(value => {

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

}


/* ==========================================================
   UNIQUE VALUES
========================================================== */

function uniqueValues(
    rows,
    field
) {

    return [
        ...new Set(

            (rows || [])
            .map(row =>
                row[field]
            )
            .filter(Boolean)

        )
    ];

}


/* ==========================================================
   EVENT NAMES
========================================================== */

function getEventNames(
    rows
) {

    return [
        ...new Set(

            (rows || [])
            .map(row =>
                row.event
            )
            .filter(Boolean)

        )
    ];

}


/* ==========================================================
   FILTER VALUE
========================================================== */

function getFilterValue(id) {

    const element =
        document.getElementById(id);


    if (!element)
        return "";


    return String(
        element.value || ""
    ).trim();

}


/* ==========================================================
   CHART ENGINE
========================================================== */

function renderChart(
    canvasId,
    type,
    dataset
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
        !Array.isArray(
            dataset.labels
        ) ||
        !Array.isArray(
            dataset.values
        )
    )
        return;


    Dashboard.charts =
        Dashboard.charts || {};


    /* ------------------------------------------------------
       DESTROY EXISTING CHART
    ------------------------------------------------------ */

    if (
        Dashboard.charts[canvasId]
    ) {

        try {

            Dashboard.charts[
                canvasId
            ].destroy();

        } catch (error) {

            console.warn(
                "Unable to destroy chart:",
                canvasId,
                error
            );

        }

    }


    /* ------------------------------------------------------
       CREATE CHART
    ------------------------------------------------------ */

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    Dashboard.charts[canvasId] =
        new Chart(
            canvas,
            {

                type: type,

                data: {

                    labels:
                        dataset.labels,

                    datasets: [

                        {

                            data:
                                dataset.values,

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                type ===
                                "doughnut"

                        }

                    }

                }

            }
        );

}


/* ==========================================================
   MISSION HEALTH CLASS
========================================================== */

function updateMissionHealthClass(
    status
) {

    const element =
        document.getElementById(
            "missionHealthStatus"
        );


    if (!element)
        return;


    element.classList.remove(

        "health-excellent",

        "health-healthy",

        "health-growing",

        "health-attention",

        "health-critical"

    );


    switch(status) {

        case "Excellent":

            element.classList.add(
                "health-excellent"
            );

            break;


        case "Healthy":

            element.classList.add(
                "health-healthy"
            );

            break;


        case "Growing":

            element.classList.add(
                "health-growing"
            );

            break;


        case "Needs Attention":

            element.classList.add(
                "health-attention"
            );

            break;


        case "Critical":

            element.classList.add(
                "health-critical"
            );

            break;

    }

}


/* ==========================================================
   STATUS CLASS
========================================================== */

function getStatusClass(
    status
) {

    switch(status) {

        case "Excellent":
            return "status-excellent";

        case "Healthy":
            return "status-healthy";

        case "Growing":
            return "status-growing";

        case "Needs Attention":
            return "status-attention";

        case "Critical":
            return "status-critical";

        default:
            return "";

    }

}


/* ==========================================================
   GENERIC LIST
========================================================== */

function renderList(
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


    (items || []).forEach(item => {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            item;


        container.appendChild(
            li
        );

    });

}


/* ==========================================================
   TEXT HELPER
========================================================== */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element)
        return;


    element.textContent =
        value ?? "";

}


/* ==========================================================
   NUMBER FORMAT
========================================================== */

function formatNumber(
    value
) {

    const number =
        Number(value || 0);


    return number.toLocaleString();

}


/* ==========================================================
   GROWTH FORMAT
========================================================== */

function formatGrowth(
    value
) {

    const number =
        Number(value || 0);


    if (number > 0)
        return `+${number}%`;


    return `${number}%`;

}


/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDate(
    value
) {

    if (!value)
        return "—";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return "—";


    return date.toLocaleDateString(
        "en-SG",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(
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
                () => {

                    callback.apply(
                        this,
                        args
                    );

                },
                delay
            );

    };

}


/* ==========================================================
   MODAL OPEN
========================================================== */

function openModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal)
        return;


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* ==========================================================
   MODAL CLOSE
========================================================== */

function closeModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal)
        return;


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ==========================================================
   MODAL BINDING
========================================================== */

function bindModalControls() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    closeModal(
                        this.dataset
                            .closeModal
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeModal(
                            modal.id
                        );

                    }

                }
            );

        });

}


/* ==========================================================
   ERROR MESSAGE
========================================================== */

function showError(
    message
) {

    console.error(
        message
    );


    const element =
        document.getElementById(
            "dashboardError"
        );


    if (!element)
        return;


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );

}


/* ==========================================================
   CLEAR ERROR
========================================================== */

function clearError() {

    const element =
        document.getElementById(
            "dashboardError"
        );


    if (!element)
        return;


    element.textContent =
        "";


    element.classList.add(
        "hidden"
    );

}


/* ==========================================================
   LOADING STATE
========================================================== */

function setDashboardLoading(
    loading
) {

    const element =
        document.getElementById(
            "dashboardLoading"
        );


    if (!element)
        return;


    element.classList.toggle(
        "hidden",
        !loading
    );

}


/* ==========================================================
   SAFE EVENT LISTENER
========================================================== */

function on(
    elementId,
    event,
    handler
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element)
        return;


    element.addEventListener(
        event,
        handler
    );

}


/* ==========================================================
   GLOBAL UI EVENTS
========================================================== */

function bindDashboardUI() {

    bindModalControls();


    on(
        "closeParticipantJourney",
        "click",
        function () {

            closeModal(
                "participantJourneyModal"
            );

        }
    );


    on(
        "refreshDashboard",
        "click",
        function () {

            loadDashboard();

        }
    );


    on(
        "resetFilters",
        "click",
        resetDashboardFilters
    );

}


/* ==========================================================
   DASHBOARD READY
========================================================== */

function dashboardReady() {

    console.log(
        "Missions Intelligence Dashboard ready."
    );


    clearError();

    updateFilterResultCount();

}

   /* ==========================================================
   PART 4
   TABLES + PARTICIPANT SEARCH + MISSION JOURNEY
========================================================== */


/* ==========================================================
   EVENT SUMMARY TABLE
========================================================== */

function renderEventSummaryTable() {

    const tbody =
        document.getElementById("eventSummaryTable");

    if (!tbody)
        return;

    tbody.innerHTML = "";

    const events =
        Dashboard.data?.tables?.eventSummary || [];

    events.forEach(event => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(event.date)}</td>
            <td>${escapeHtml(event.event)}</td>
            <td>${escapeHtml(event.type)}</td>
            <td>${event.registered ?? 0}</td>
            <td>${event.attended ?? 0}</td>
            <td>${event.attendance ?? 0}%</td>
            <td>${event.firstTimers ?? 0}</td>
            <td>${event.repeat ?? 0}</td>
            <td>${event.churches ?? 0}</td>
            <td>${escapeHtml(event.status)}</td>
        `;

        tr.style.cursor = "pointer";

        tr.addEventListener(
            "click",
            () => openEventDetails(event.event)
        );

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
        Dashboard.data
            ?.tables
            ?.participantSummary || [];

    const searchElement =
        document.getElementById(
            "participantTableSearch"
        );

    const search =
        (
            searchElement?.value || ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        people.filter(person => {

            if (!search)
                return true;

            return [

                person.name,
                person.church,
                person.mobile,
                person.email,
                person.leadership,
                person.status

            ]
            .filter(Boolean)
            .some(value =>
                String(value)
                    .toLowerCase()
                    .includes(search)
            );

        });


    /*
       Sort participant directory
       alphabetically by NAME
    */

    filtered.sort((a, b) =>
        String(a.name || "")
            .localeCompare(
                String(b.name || ""),
                undefined,
                {
                    sensitivity: "base"
                }
            )
    );


    filtered.forEach(person => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                <button
                    type="button"
                    class="participant-link"
                >
                    ${escapeHtml(
                        person.name || "Unnamed"
                    )}
                </button>
            </td>

            <td>
                ${escapeHtml(
                    person.church || "-"
                )}
            </td>

            <td>
                ${person.age ?? "-"}
            </td>

            <td>
                ${person.events ?? 0}
            </td>

            <td>
                ${person.attendanceRate ?? 0}%
            </td>

            <td>
                ${escapeHtml(
                    person.leadership || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    person.status || "-"
                )}
            </td>

        `;


        const button =
            tr.querySelector(
                ".participant-link"
            );


        if (button) {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openParticipantJourney(
                        person.email ||
                        person.mobile ||
                        person.name
                    );

                }
            );

        }


        /*
           Allow clicking anywhere on the row
        */

        tr.style.cursor = "pointer";

        tr.addEventListener(
            "click",
            () => {

                openParticipantJourney(
                    person.email ||
                    person.mobile ||
                    person.name
                );

            }
        );


        tbody.appendChild(tr);

    });


    /*
       Empty state
    */

    if (!filtered.length) {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td
                colspan="7"
                style="text-align:center;"
            >
                No participants found.
            </td>
        `;

        tbody.appendChild(tr);

    }

}


/* ==========================================================
   PARTICIPANT TABLE SEARCH
========================================================== */

function setupParticipantTableSearch() {

    const search =
        document.getElementById(
            "participantTableSearch"
        );

    if (!search)
        return;


    if (
        search.dataset.bound === "true"
    )
        return;


    search.dataset.bound = "true";


    search.addEventListener(
        "input",
        debounce(
            function () {

                renderParticipantDirectory();

            },
            250
        )
    );

}


/* ==========================================================
   PARTICIPANT SEARCH
   MAIN SEARCH BOX
========================================================== */

function setupParticipantSearch() {

    const search =
        document.getElementById(
            "participantSearch"
        );

    const resultsContainer =
        document.getElementById(
            "participantSearchResults"
        );


    if (!search)
        return;


    if (
        search.dataset.bound === "true"
    )
        return;


    search.dataset.bound = "true";


    search.addEventListener(
        "input",
        debounce(
            async function () {

                const value =
                    this.value.trim();


                if (!value) {

                    if (
                        resultsContainer
                    )
                        resultsContainer.innerHTML =
                            "";

                    return;

                }


                /*
                   Search participant
                   through REPORTS.GS
                */

                try {

                    const result =
                        await API.post(
                            "searchParticipant",
                            {
                                searchTerm:
                                    value
                            }
                        );


                    if (
                        !result?.success
                    )
                        throw new Error(
                            result?.message ||
                            "Participant search failed."
                        );


                    const results =
                        Array.isArray(
                            result.data
                        )
                            ? result.data
                            : [];


                    renderParticipantSearchResults(
                        results,
                        resultsContainer
                    );


                }
                catch (error) {

                    console.error(
                        "PARTICIPANT SEARCH ERROR:",
                        error
                    );


                    if (
                        resultsContainer
                    ) {

                        resultsContainer.innerHTML = `
                            <p>
                                ${escapeHtml(
                                    error.message
                                )}
                            </p>
                        `;

                    }

                }

            },
            350
        )
    );

}


/* ==========================================================
   PARTICIPANT SEARCH RESULTS
========================================================== */

function renderParticipantSearchResults(
    results,
    container
) {

    if (!container)
        return;


    container.innerHTML = "";


    if (!results.length) {

        container.innerHTML =
            "<p>No participant found.</p>";

        return;

    }


    results.forEach(person => {

        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.className =
            "participantSearchResult";


        button.innerHTML = `

            <strong>
                ${escapeHtml(
                    person.name ||
                    "Unnamed"
                )}
            </strong>

            <span>
                ${escapeHtml(
                    person.church || ""
                )}
            </span>

        `;


        button.addEventListener(
            "click",
            () => {

                openParticipantJourney(
                    person.personKey ||
                    person.email ||
                    person.mobile ||
                    person.name
                );

            }
        );


        container.appendChild(
            button
        );

    });

}


/* ==========================================================
   OPEN PARTICIPANT JOURNEY
========================================================== */

async function openParticipantJourney(
    identifier
) {

    showLoading();


    try {

        const result =
            await API.post(
                "getParticipantDetails",
                {
                    identifier:
                        identifier
                }
            );


        if (
            !result?.success
        )
            throw new Error(
                result?.message ||
                "Unable to load participant journey."
            );


        renderJourneyModal(
            result.data
        );

    }
    catch (error) {

        console.error(
            "JOURNEY ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to load participant journey."
        );

    }
    finally {

        hideLoading();

    }

}


/* ==========================================================
   PARTICIPANT JOURNEY SUMMARY
========================================================== */

function renderParticipantJourneySummary() {

    const tbody =
        document.getElementById(
            "participantJourneySummaryTable"
        );

    if (!tbody)
        return;


    tbody.innerHTML = "";


    const people =
        Dashboard.data
            ?.participantJourney || [];


    /*
       Sort by participant name
       A-Z
    */

    const sorted =
        [...people].sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    )
        );


    sorted
        .slice(0, 20)
        .forEach(person => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        person.name ||
                        "Unnamed"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        person.church ||
                        "-"
                    )}
                </td>

                <td>
                    ${person.events ?? 0}
                </td>

                <td>
                    ${person.attended ?? 0}
                </td>

                <td>
                    ${person.missionTrips ?? 0}
                </td>

                <td>
                    ${person.totalEngagement ?? 0}
                </td>

            `;


            tr.style.cursor =
                "pointer";


            tr.addEventListener(
                "click",
                () =>
                    openParticipantJourney(
                        person.personKey
                    )
            );


            tbody.appendChild(tr);

        });


    if (!sorted.length) {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `
            <td
                colspan="6"
                style="text-align:center;"
            >
                No participant journey data.
            </td>
        `;


        tbody.appendChild(tr);

    }

}


/* ==========================================================
   JOURNEY MODAL
========================================================== */

function renderJourneyModal(
    data
) {

    const modal =
        document.getElementById(
            "detailsModal"
        );

    const title =
        document.getElementById(
            "modalTitle"
        );

    const body =
        document.getElementById(
            "modalBody"
        );


    if (
        !modal ||
        !title ||
        !body
    )
        return;


    /*
       Participant not found
    */

    if (
        !data ||
        !data.found
    ) {

        title.textContent =
            "Participant Not Found";


        body.innerHTML = `
            <p>
                No missional journey was
                found for this participant.
            </p>
        `;


        modal.classList.remove(
            "hidden"
        );

        return;

    }


    const person =
        data.person || {};


    const summary =
        data.summary || {};


    const journey =
        Array.isArray(
            data.journey
        )
            ? data.journey
            : [];


    title.textContent =
        `Missional Journey — ${
            person.name ||
            "Participant"
        }`;


    /*
       Build journey timeline
    */

    const entries =
        journey
            .map(item => {

                const date =
                    item.dateText ||
                    formatDate(
                        item.date
                    );


                const attended =
                    item.attended;


                return `

                    <div
                        class="journeyEntry"
                    >

                        <div
                            class="journeyDate"
                        >
                            ${escapeHtml(
                                date
                            )}
                        </div>


                        <div
                            class="journeyContent"
                        >

                            <strong>
                                ${escapeHtml(
                                    item.title ||
                                    "Mission engagement"
                                )}
                            </strong>


                            ${
                                item.eventType ||
                                item.type
                                    ? `
                                        <span
                                            class="journeyType"
                                        >
                                            ${escapeHtml(
                                                item.eventType ||
                                                item.type ||
                                                ""
                                            )}
                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                item.description
                                    ? `
                                        <p>
                                            ${escapeHtml(
                                                item.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }


                            ${
                                item.location
                                    ? `
                                        <small>
                                            ${escapeHtml(
                                                item.location
                                            )}
                                        </small>
                                      `
                                    : ""
                            }


                            <small>
                                ${
                                    attended
                                        ? "Attended"
                                        : "Registered"
                                }
                            </small>

                        </div>

                    </div>

                `;

            })
            .join("");


    /*
       Modal summary
    */

    body.innerHTML = `

        <div
            class="journeyParticipantHeader"
        >

            <h3>
                ${escapeHtml(
                    person.name ||
                    "Participant"
                )}
            </h3>


            ${
                person.church
                    ? `
                        <p>
                            ${escapeHtml(
                                person.church
                            )}
                        </p>
                      `
                    : ""
            }

        </div>


        <div
            class="journeySummary"
        >

            <div>

                <strong>
                    ${summary.events ?? 0}
                </strong>

                <span>
                    Events
                </span>

            </div>


            <div>

                <strong>
                    ${summary.attended ?? 0}
                </strong>

                <span>
                    Attended
                </span>

            </div>


            <div>

                <strong>
                    ${summary.missionTrips ?? 0}
                </strong>

                <span>
                    Mission Trips
                </span>

            </div>


            <div>

                <strong>
                    ${summary.totalJourneyEntries ?? 0}
                </strong>

                <span>
                    Journey Entries
                </span>

            </div>

        </div>


        <div
            class="journeyTimeline"
        >

            ${
                entries ||
                "<p>No journey entries.</p>"
            }

        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

}


/* ==========================================================
   EVENT DETAILS
========================================================== */

async function openEventDetails(
    eventName
) {

    showLoading();


    try {

        const result =
            await API.post(
                "getEventDetails",
                {
                    eventName:
                        eventName,

                    event:
                        eventName
                }
            );


        if (
            !result?.success
        )
            throw new Error(
                result?.message ||
                "Unable to load event details."
            );


        openModal(
            eventName,
            result.data
        );

    }
    catch (error) {

        console.error(
            "EVENT DETAILS ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to load event details."
        );

    }
    finally {

        hideLoading();

    }

}


/* ==========================================================
   GENERIC DETAILS MODAL
========================================================== */

function openModal(
    title,
    data
) {

    const modal =
        document.getElementById(
            "detailsModal"
        );

    const titleElement =
        document.getElementById(
            "modalTitle"
        );

    const body =
        document.getElementById(
            "modalBody"
        );


    if (
        !modal ||
        !titleElement ||
        !body
    )
        return;


    titleElement.textContent =
        title || "Details";


    body.innerHTML =
        `
        <pre>
${escapeHtml(
    JSON.stringify(
        data,
        null,
        2
    )
)}
        </pre>
        `;


    modal.classList.remove(
        "hidden"
    );

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeModal() {

    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (modal)
        modal.classList.add(
            "hidden"
        );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
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
   DATE FORMATTER
========================================================== */

function formatDate(
    date
) {

    if (!date)
        return "-";


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    )
        return String(date);


    return d.toLocaleDateString(
        "en-SG",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}

   /* ==========================================================
   PART 5
   CHARTS + FILTERS + DASHBOARD REFRESH
========================================================== */


/* ==========================================================
   CHART REGISTRY
========================================================== */

function destroyChart(name) {

    if (
        Dashboard.charts &&
        Dashboard.charts[name]
    ) {

        try {

            Dashboard.charts[name].destroy();

        }
        catch (error) {

            console.warn(
                "Unable to destroy chart:",
                name,
                error
            );

        }

        delete Dashboard.charts[name];

    }

}


function createChart(
    name,
    canvasId,
    config
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas)
        return null;


    destroyChart(name);


    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js is not available."
        );

        return null;

    }


    Dashboard.charts[name] =
        new Chart(
            canvas.getContext("2d"),
            config
        );


    return Dashboard.charts[name];

}


/* ==========================================================
   CHART OPTIONS
========================================================== */

function standardChartOptions(
    beginAtZero = true
) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: true

            }

        },

        scales: {

            y: {

                beginAtZero

            }

        }

    };

}


/* ==========================================================
   PARTICIPANT TYPE CHART
========================================================== */

function renderFirstTimeReturningChart() {

    const data =
        Dashboard.data
            ?.participants
            ?.firstTimeVsReturning;


    if (!data)
        return;


    createChart(
        "firstTimeReturning",
        "firstTimeReturningChart",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    data:
                        data.values || []

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


/* ==========================================================
   AGE DISTRIBUTION
========================================================== */

function renderAgeDistributionChart() {

    const data =
        Dashboard.data
            ?.participants
            ?.ageDistribution;


    if (!data)
        return;


    createChart(
        "ageDistribution",
        "ageDistributionChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Participants",

                    data:
                        data.values || []

                }]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   CHURCH PARTICIPATION
========================================================== */

function renderChurchParticipationChart() {

    const data =
        Dashboard.data
            ?.churches
            ?.participation;


    if (!data)
        return;


    createChart(
        "churchParticipation",
        "churchParticipationChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Participants",

                    data:
                        data.values || []

                }]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   CHURCH ATTENDANCE
========================================================== */

function renderChurchAttendanceChart() {

    const data =
        Dashboard.data
            ?.churches
            ?.attendance;


    if (!data)
        return;


    createChart(
        "churchAttendance",
        "churchAttendanceChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Attendance %",

                    data:
                        data.values || []

                }]

            },

            options: {

                ...standardChartOptions(),

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100

                    }

                }

            }

        }
    );

}


/* ==========================================================
   EVENT POPULARITY
========================================================== */

function renderEventPopularityChart() {

    const data =
        Dashboard.data
            ?.events
            ?.popularity;


    if (!data)
        return;


    createChart(
        "eventPopularity",
        "eventPopularityChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Registrations",

                    data:
                        data.values || []

                }]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EVENT ATTENDANCE
========================================================== */

function renderEventAttendanceChart() {

    const data =
        Dashboard.data
            ?.events
            ?.attendance;


    if (!data)
        return;


    createChart(
        "eventAttendance",
        "eventAttendanceChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Attendance %",

                    data:
                        data.values || []

                }]

            },

            options: {

                ...standardChartOptions(),

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100

                    }

                }

            }

        }
    );

}


/* ==========================================================
   MONTHLY TREND
========================================================== */

function renderMonthlyTrendChart() {

    const data =
        Dashboard.data
            ?.events
            ?.monthlyTrend;


    if (!data)
        return;


    createChart(
        "monthlyTrend",
        "monthlyTrendChart",
        {

            type: "line",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Registrations",

                    data:
                        data.values || [],

                    tension:
                        0.25

                }]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EVENT TYPE CHART
========================================================== */

function renderEventTypeChart() {

    const data =
        Dashboard.data
            ?.events
            ?.eventTypes;


    if (!data)
        return;


    createChart(
        "eventTypes",
        "eventTypeChart",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    data:
                        data.values || []

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


/* ==========================================================
   LEADERSHIP PIPELINE
========================================================== */

function renderLeadershipPipelineChart() {

    const data =
        Dashboard.data
            ?.leadership
            ?.pipeline;


    if (!data)
        return;


    createChart(
        "leadershipPipeline",
        "leadershipPipelineChart",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    label:
                        "Participants",

                    data:
                        data.values || []

                }]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EXPERIENCE LEVEL
========================================================== */

function renderExperienceChart() {

    const data =
        Dashboard.data
            ?.leadership
            ?.experience;


    if (!data)
        return;


    createChart(
        "experience",
        "experienceChart",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [{

                    data:
                        data.values || []

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


/* ==========================================================
   RENDER ALL CHARTS
========================================================== */

function renderAllCharts() {

    renderFirstTimeReturningChart();

    renderAgeDistributionChart();

    renderChurchParticipationChart();

    renderChurchAttendanceChart();

    renderEventPopularityChart();

    renderEventAttendanceChart();

    renderMonthlyTrendChart();

    renderEventTypeChart();

    renderLeadershipPipelineChart();

    renderExperienceChart();

}


/* ==========================================================
   KPI RENDERING
========================================================== */

function renderKPIs() {

    const kpis =
        Dashboard.data?.kpis;


    if (!kpis)
        return;


    setText(
        "kpiRegistrations",
        kpis.registrations
    );


    setText(
        "kpiParticipants",
        kpis.uniqueParticipants
    );


    setText(
        "kpiRepeatParticipants",
        kpis.repeatParticipants
    );


    setText(
        "kpiFirstTimers",
        kpis.firstTimers
    );


    setText(
        "kpiEvents",
        kpis.totalEvents
    );


    setText(
        "kpiChurches",
        kpis.totalChurches
    );


    setText(
        "kpiAttendance",
        `${kpis.attendanceRate}%`
    );


    setText(
        "kpiGrowth",
        `${kpis.growthRate}%`
    );


    setText(
        "kpiMissionHealth",
        kpis.missionHealthScore
    );


    setText(
        "kpiMissionHealthStatus",
        kpis.missionHealthStatus
    );


    /*
       Optional executive health description
    */

    setText(
        "missionHealthDescription",
        kpis.missionHealthDescription
    );


    /*
       Add status class
    */

    const health =
        document.getElementById(
            "kpiMissionHealthStatus"
        );


    if (health) {

        health.classList.remove(
            "excellent",
            "healthy",
            "growing",
            "needs-attention",
            "critical"
        );


        const status =
            String(
                kpis.missionHealthStatus ||
                ""
            )
            .toLowerCase()
            .replace(/\s+/g, "-");


        if (status)
            health.classList.add(status);

    }

}


/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */

function renderExecutiveSummary() {

    const executive =
        Dashboard.data?.executive;


    if (!executive)
        return;


    setText(
        "executiveTitle",
        executive.title
    );


    const overview =
        document.getElementById(
            "executiveOverview"
        );


    if (overview) {

        overview.innerHTML =
            (executive.overview || [])
                .map(item =>
                    `<p>${escapeHtml(item)}</p>`
                )
                .join("");

    }


    const highlights =
        executive.highlights ||
        {};


    setText(
        "topChurch",
        highlights.topChurch
    );


    setText(
        "topEvent",
        highlights.topEvent
    );


    setText(
        "topReferral",
        highlights.topReferral
    );


    setText(
        "latestEvent",
        highlights.newestEvent
    );


    setText(
        "missionHealth",
        highlights.missionHealth
    );

}


/* ==========================================================
   MISSION INSIGHTS
========================================================== */

function renderMissionInsights() {

    const insights =
        Dashboard.data
            ?.missionInsights;


    if (!insights)
        return;


    renderInsightGroup(
        "celebrateInsights",
        insights.celebrate
    );


    renderInsightGroup(
        "warningInsights",
        insights.warning
    );


    renderInsightGroup(
        "recommendationInsights",
        insights.recommendation
    );


    renderInsightGroup(
        "riskInsights",
        insights.risk
    );

}


function renderInsightGroup(
    elementId,
    items
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        !Array.isArray(items) ||
        !items.length
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
            "missionInsight";


        div.textContent =
            item;


        container.appendChild(
            div
        );

    });

}


/* ==========================================================
   FILTER STATE
========================================================== */

function getActiveFilters() {

    return {

        year:
            getValue(
                "filterYear"
            ),

        church:
            getValue(
                "filterChurch"
            ),

        eventType:
            getValue(
                "filterEventType"
            ),

        event:
            getValue(
                "filterEvent"
            ),

        search:
            getValue(
                "participantSearch"
            )

    };

}


/* ==========================================================
   FILTER DATA
========================================================== */

function applyClientFilters() {

    const source =
        Dashboard.rawData ||
        [];


    if (!source.length)
        return [];


    const filters =
        getActiveFilters();


    return source.filter(row => {

        /*
           YEAR
        */

        if (
            filters.year &&
            getYear(row.eventDate) !==
                String(filters.year)
        ) {

            return false;

        }


        /*
           CHURCH
        */

        if (
            filters.church &&
            String(row.church || "")
                .toLowerCase() !==
                String(filters.church)
                    .toLowerCase()
        ) {

            return false;

        }


        /*
           EVENT TYPE
        */

        if (
            filters.eventType &&
            String(row.eventType || "")
                .toLowerCase() !==
                String(filters.eventType)
                    .toLowerCase()
        ) {

            return false;

        }


        /*
           EVENT
        */

        if (
            filters.event &&
            String(row.eventName || "")
                .toLowerCase() !==
                String(filters.event)
                    .toLowerCase()
        ) {

            return false;

        }


        /*
           PARTICIPANT SEARCH
        */

        if (
            filters.search
        ) {

            const search =
                filters.search
                    .toLowerCase();


            const matches =
                [

                    row.name,
                    row.email,
                    row.mobile,
                    row.church,
                    row.eventName

                ]
                .filter(Boolean)
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(search)
                );


            if (!matches)
                return false;

        }


        return true;

    });

}


/* ==========================================================
   FILTER SETUP
========================================================== */

function setupFilters() {

    const filterIds = [

        "filterYear",
        "filterChurch",
        "filterEventType",
        "filterEvent"

    ];


    filterIds.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (!element)
                return;


            if (
                element.dataset.bound ===
                "true"
            )
                return;


            element.dataset.bound =
                "true";


            element.addEventListener(
                "change",
                () => {

                    refreshFilteredDashboard();

                }
            );

        }
    );


    const reset =
        document.getElementById(
            "resetFilters"
        );


    if (
        reset &&
        reset.dataset.bound !== "true"
    ) {

        reset.dataset.bound =
            "true";


        reset.addEventListener(
            "click",
            resetDashboardFilters
        );

    }

}


/* ==========================================================
   POPULATE FILTER OPTIONS
========================================================== */

function populateFilters() {

    const data =
        Dashboard.rawData ||
        [];


    populateSelect(
        "filterYear",
        uniqueSorted(
            data
                .map(row =>
                    getYear(
                        row.eventDate
                    )
                )
                .filter(Boolean)
        )
    );


    populateSelect(
        "filterChurch",
        uniqueSorted(
            data
                .map(row =>
                    row.church
                )
                .filter(Boolean)
        )
    );


    populateSelect(
        "filterEventType",
        uniqueSorted(
            data
                .map(row =>
                    row.eventType
                )
                .filter(Boolean)
        )
    );


    populateSelect(
        "filterEvent",
        uniqueSorted(
            data
                .map(row =>
                    row.eventName
                )
                .filter(Boolean)
        )
    );

}


/* ==========================================================
   SELECT POPULATOR
========================================================== */

function populateSelect(
    id,
    values
) {

    const select =
        document.getElementById(id);


    if (!select)
        return;


    const current =
        select.value;


    /*
       Preserve first option
       such as "All"
    */

    const first =
        select.options.length
            ? select.options[0]
            : null;


    select.innerHTML =
        "";


    if (first) {

        select.appendChild(
            first
        );

    }
    else {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "All";


        select.appendChild(
            option
        );

    }


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
        values.includes(current)
    ) {

        select.value =
            current;

    }

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetDashboardFilters() {

    [

        "filterYear",
        "filterChurch",
        "filterEventType",
        "filterEvent",
        "participantSearch"

    ]
    .forEach(id => {

        const element =
            document.getElementById(id);


        if (element)
            element.value = "";

    });


    const results =
        document.getElementById(
            "participantSearchResults"
        );


    if (results)
        results.innerHTML =
            "";


    refreshFilteredDashboard();

}


/* ==========================================================
   FILTERED DASHBOARD REFRESH
========================================================== */

function refreshFilteredDashboard() {

    const filtered =
        applyClientFilters();


    /*
       Keep original dashboard
       available for reset/search.
    */

    Dashboard.filteredData =
        filtered;


    /*
       For now render participant
       directory from the filtered
       source when available.
    */

    renderFilteredKPIs(
        filtered
    );


    renderFilteredParticipantDirectory(
        filtered
    );

}


/* ==========================================================
   FILTERED KPI CALCULATION
========================================================== */

function renderFilteredKPIs(
    data
) {

    if (!data)
        return;


    const registrations =
        data.length;


    const participants =
        new Set(
            data
                .map(row =>
                    row.email ||
                    row.mobile ||
                    row.name
                )
                .filter(Boolean)
        );


    const attended =
        data.filter(
            row =>
                row.attendance === true
        ).length;


    const events =
        new Set(
            data
                .map(row =>
                    row.eventName
                )
                .filter(Boolean)
        );


    const churches =
        new Set(
            data
                .map(row =>
                    row.church
                )
                .filter(Boolean)
        );


    const attendanceRate =
        registrations
            ? Math.round(
                attended /
                registrations *
                100
            )
            : 0;


    setText(
        "kpiRegistrations",
        registrations
    );


    setText(
        "kpiParticipants",
        participants.size
    );


    setText(
        "kpiEvents",
        events.size
    );


    setText(
        "kpiChurches",
        churches.size
    );


    setText(
        "kpiAttendance",
        `${attendanceRate}%`
    );

}


/* ==========================================================
   FILTERED PARTICIPANT DIRECTORY
========================================================== */

function renderFilteredParticipantDirectory(
    data
) {

    const tbody =
        document.getElementById(
            "participantSummaryTable"
        );


    if (!tbody)
        return;


    const people = {};


    data.forEach(row => {

        const id =
            row.email ||
            row.mobile ||
            row.name;


        if (!id)
            return;


        if (!people[id]) {

            people[id] = {

                name:
                    row.name,

                church:
                    row.church,

                age:
                    row.age,

                events:
                    0,

                attended:
                    0

            };

        }


        people[id].events++;


        if (
            row.attendance
        )
            people[id].attended++;

    });


    const participants =
        Object.values(
            people
        )
        .map(person => ({

            ...person,

            attendanceRate:
                person.events
                    ? Math.round(
                        person.attended /
                        person.events *
                        100
                    )
                    : 0

        }))
        .sort(
            (a, b) =>
                String(
                    a.name || ""
                )
                .localeCompare(
                    String(
                        b.name || ""
                    ),
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


    tbody.innerHTML =
        "";


    participants.forEach(
        person => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        person.name ||
                        "Unnamed"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        person.church ||
                        "-"
                    )}
                </td>

                <td>
                    ${person.age ?? "-"}
                </td>

                <td>
                    ${person.events}
                </td>

                <td>
                    ${person.attendanceRate}%
                </td>

            `;


            tbody.appendChild(
                tr
            );

        });


    if (!participants.length) {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `
            <td
                colspan="5"
                style="text-align:center;"
            >
                No participants match the
                selected filters.
            </td>
        `;


        tbody.appendChild(
            tr
        );

    }

}


/* ==========================================================
   UTILITY FUNCTIONS
========================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element)
        return;


    element.textContent =
        value ??
        "";

}


function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value
        : "";

}


function getYear(date) {

    if (!date)
        return "";


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    )
        return "";


    return String(
        d.getFullYear()
    );

}


function uniqueSorted(
    values
) {

    return [
        ...new Set(
            values
        )
    ]
    .sort(
        (a, b) =>
            String(a)
                .localeCompare(
                    String(b),
                    undefined,
                    {
                        numeric: true,
                        sensitivity:
                            "base"
                    }
                )
    );

}


function debounce(
    fn,
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
                    fn.apply(
                        this,
                        args
                    ),
                delay
            );

    };

}


/* ==========================================================
   FINAL DASHBOARD RENDER
========================================================== */

function renderDashboard() {

    console.log(
        "Rendering Missions Intelligence Dashboard"
    );


    renderKPIs();

    renderExecutiveSummary();

    renderMissionInsights();

    renderEventSummaryTable();

    renderParticipantDirectory();

    renderParticipantJourneySummary();

    renderAllCharts();

    setupParticipantTableSearch();

    setupParticipantSearch();

    setupFilters();

    populateFilters();

}


/* ==========================================================
   UPDATE DASHBOARD DATA
========================================================== */

function updateDashboardData(
    response
) {

    if (!response)
        return;


    /*
       Support both:

       {
           success:true,
           data:{...}
       }

       and

       {
           success:true,
           dashboard:{...}
       }
    */

    const payload =
        response.data ||
        response.dashboard ||
        response;


    Dashboard.data =
        payload;


    renderDashboard();

}


/* ==========================================================
   SAFE DASHBOARD REFRESH
========================================================== */

async function refreshDashboard() {

    showLoading();


    try {

        const response =
            await API.post(
                "getMissionDashboard",
                {}
            );


        if (
            !response?.success
        )
            throw new Error(
                response?.message ||
                "Unable to refresh dashboard."
            );


        updateDashboardData(
            response
        );


    }
    catch (error) {

        console.error(
            "DASHBOARD REFRESH ERROR:",
            error
        );


        showDashboardError(
            error.message
        );

    }
    finally {

        hideLoading();

    }

}


/* ==========================================================
   DASHBOARD ERROR
========================================================== */

function showDashboardError(
    message
) {

    const element =
        document.getElementById(
            "dashboardError"
        );


    if (!element)
        return;


    element.textContent =
        message ||
        "Unable to load dashboard.";


    element.classList.remove(
        "hidden"
    );

}

   


}

function renderMissionTripSummary() {
    const tbody = document.getElementById("missionTripSummaryTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    const summary = Dashboard.data?.missionTrips?.tripSummary || [];

    summary.forEach(trip => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(trip.tripCode || trip.tripID || "-")}</td>
            <td>${escapeHtml(trip.location || "-")}</td>
            <td>${formatDate(trip.startDate)}</td>
            <td>${trip.participants ?? 0}</td>
        `;

        tbody.appendChild(tr);
    });
}

function renderParticipantCharts() {

    const participants = Dashboard.data?.participants || {};

    /*
     * Participant Growth
     */
    const growthCanvas = document.getElementById("participantGrowthChart");

    if (growthCanvas) {

        if (Dashboard.charts.participantGrowth) {
            Dashboard.charts.participantGrowth.destroy();
        }

        Dashboard.charts.participantGrowth = new Chart(
            growthCanvas.getContext("2d"),
            {
                type: "line",

                data: {
                    labels: participants.growthLabels || [],
                    datasets: [
                        {
                            label: "Participants",
                            data: participants.growthData || [],
                            tension: 0.3
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: true
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            }
        );
    }


    /*
     * Participant Type
     */
    const typeCanvas = document.getElementById("participantTypeChart");

    if (typeCanvas) {

        if (Dashboard.charts.participantType) {
            Dashboard.charts.participantType.destroy();
        }

        Dashboard.charts.participantType = new Chart(
            typeCanvas.getContext("2d"),
            {
                type: "doughnut",

                data: {
                    labels: participants.typeLabels || [],
                    datasets: [
                        {
                            label: "Participants",
                            data: participants.typeData || []
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            }
        );
    }


    /*
     * Participant Engagement
     */
    const engagementCanvas =
        document.getElementById("participantEngagementChart");

    if (engagementCanvas) {

        if (Dashboard.charts.participantEngagement) {
            Dashboard.charts.participantEngagement.destroy();
        }

        Dashboard.charts.participantEngagement = new Chart(
            engagementCanvas.getContext("2d"),
            {
                type: "bar",

                data: {
                    labels: participants.engagementLabels || [],
                    datasets: [
                        {
                            label: "Participants",
                            data: participants.engagementData || []
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            }
        );
    }
}
