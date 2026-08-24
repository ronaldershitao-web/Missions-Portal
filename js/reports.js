
/* ==========================================================
   MISSIONS INTELLIGENCE DASHBOARD
   reports.js

   Compatible with current REPORTS.GS API

   PRIMARY API
   ----------------------------------------------------------
   API.post("getMissionDashboard", filters)

   Expected response:
   {
       success: true,
       data: {
           generatedAt,
           filters,
           totalRows,
           dashboard: {
               kpis,
               executive,
               missionInsights,
               participants,
               events,
               churches,
               leadership,
               tables,
               missionTrips,
               participantJourney
           }
       }
   }

   ========================================================== */


/* ==========================================================
   INITIALISATION
========================================================== */

console.log(
    "Missions Intelligence Dashboard"
);


/* ==========================================================
   GLOBAL DASHBOARD STATE
========================================================== */

const Dashboard = {

    data: null,

    missionData: null,

    serverFilters: {},

    filteredParticipants: [],

    filteredData: [],

    charts: {},

    /* Backward-compatible alias */
    s: {},

    filters: {

        year: "",

        startDate: "",

        endDate: ""

    },

    initialised: false,

    participantSearchTimer: null,

    uiBound: false,

    filtersBound: false

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

        clearError();

        await loadDashboard();

        renderDashboard();

        initialiseFilters();

        bindDashboardUI();

        updateLastRefresh();

        Dashboard.initialised = true;

        console.log(
            "Missions Intelligence Dashboard ready."
        );

    }

    catch (error) {

        console.error(
            "DASHBOARD INITIALISATION ERROR:",
            error
        );

        showError(
            error.message ||
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

    console.log("=== LOAD DASHBOARD START ===");

    const result =
        await API.post(
            "getMissionDashboard",
            Dashboard.filters
        );

    console.log("=== API POST COMPLETED ===");
    console.log("RESULT:", result);
    console.log("RESULT TYPE:", typeof result);

    if (
        !result ||
        result.success === false
    ) {

        throw new Error(
            result?.message ||
            "Unable to load mission dashboard."
        );

    }

    const payload =
        result.data || {};

    console.log("=== PAYLOAD ===");
    console.log(payload);

    console.log("=== MISSION TRIPS ===");
    console.log(payload.missionTrips);


    console.log(
        "DASHBOARD PAYLOAD:",
        payload
    );


    /*
       Server filter options
    */

    Dashboard.serverFilters =
        payload.filters || {};


    /*
       Main event dashboard
    */

    Dashboard.data =
        payload.dashboard ||
        payload;


    if (!Dashboard.data) {

        throw new Error(
            "Mission dashboard data was not returned."
        );

    }


    /*
       ========================================================
       MISSION TRIP DATA
       ========================================================

       Support both possible GS structures:

       1. payload.missionTrips

       2. payload.dashboard.missionTrips
    */

    Dashboard.missionData =
        payload.missionData ||
        Dashboard.data.missionTrips ||
        null;


    console.log(
        "MISSION TRIP DATA:",
       Dashboard.data.missionTrips
    );

   console.log(
  "=== MISSION TRIP DEBUG ===",
  Dashboard.missionData?.summary?.debug
);


    /*
       Preserve participant source
    */

    Dashboard.filteredParticipants =
        Dashboard.data
            ?.tables
            ?.participantSummary ||
        [];


    /*
       Preserve raw data if REPORTS.GS
       provides it.
    */

    Dashboard.rawData =
        Dashboard.data.rawData ||
        Dashboard.data.rows ||
        payload.rawData ||
        [];


    console.log(
        "Dashboard loaded:",
        Dashboard.data
    );

}

/* ==========================================================
   REFRESH DASHBOARD
========================================================== */

async function refreshDashboard() {

    showLoading();

    clearError();

    try {

        await loadDashboard();

        renderDashboard();

        initialiseFilters();

        updateLastRefresh();

    }

    catch (error) {

        console.error(
            "DASHBOARD REFRESH ERROR:",
            error
        );

        showError(
            error.message ||
            "Unable to refresh dashboard."
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   MAIN DASHBOARD RENDER
========================================================== */

function renderDashboard() {

    if (!Dashboard.data)
        return;


    console.log(
        "Rendering dashboard:",
        Dashboard.data
    );


    /* ------------------------------------------------------
       TOP LINE
    ------------------------------------------------------ */

    renderKPIs();


    /* ------------------------------------------------------
       EXECUTIVE SUMMARY
    ------------------------------------------------------ */

    renderExecutiveSummary();


    /* ------------------------------------------------------
       MISSION INSIGHTS
    ------------------------------------------------------ */

    renderMissionInsights();


    /* ------------------------------------------------------
       MISSION TRIPS
    ------------------------------------------------------ */

 renderEventTopLines();


    /* ------------------------------------------------------
       PARTICIPANTS
    ------------------------------------------------------ */

    renderParticipants();


    renderParticipantDirectory();


    renderParticipantJourney();



    /* ------------------------------------------------------
       EVENTS
    ------------------------------------------------------ */

    renderEvent();


    renderEventSummaryTable();


    /* ------------------------------------------------------
       CHURCHES
    ------------------------------------------------------ */

    renderChurches();


    /* ------------------------------------------------------
       LEADERSHIP
    ------------------------------------------------------ */

    renderLeadership();


    /* ------------------------------------------------------
       CHARTS
    ------------------------------------------------------ */

    renderAllCharts();


    /* ------------------------------------------------------
       FILTER RESULT
    ------------------------------------------------------ */

    updateFilterResultCount();
   renderMissionTripSummary();

   renderMissionTripLocationSummary();

}


/* ==========================================================
   KPI RENDERING
========================================================== */

function renderKPIs() {

    const k =
        Dashboard.data?.kpis;

    if (!k)
        return;


    setText(
        "kpiRegistrations",
        formatNumber(
            k.registrations
        )
    );


    setText(
        "kpiParticipants",
        formatNumber(
            k.uniqueParticipants
        )
    );


    /*
       Some versions of HTML used
       kpiRepeat while others used
       kpiRepeatParticipants.
    */

    setTextMultiple(
        [
            "kpiReturning",
            "kpiRepeat",
            "kpiRepeatParticipants"
        ],
        formatNumber(
            k.repeatParticipants
        )
    );


    setText(
        "kpiFirstTimers",
        formatNumber(
            k.firstTimers
        )
    );


    setText(
        "kpiEvents",
        formatNumber(
            k.totalEvents
        )
    );


    setText(
        "kpiChurches",
        formatNumber(
            k.totalChurches
        )
    );


    setText(
        "kpiAttendance",
        `${Number(
            k.attendanceRate || 0
        )}%`
    );


    setText(
        "kpiGrowth",
        formatGrowth(
            k.growthRate
        )
    );


    const averageEventSize =
    Dashboard.data?.averages.average || 0;

setText(
    "kpiAverageEvent",
    formatNumber(
        averageEventSize
    )
);


    /*
       Mission Health
    */

    setTextMultiple(
        [
            "missionHealthScore",
            "kpiMissionHealth"
        ],
        k.missionHealthScore ?? 0
    );


    setTextMultiple(
        [
            "missionHealthStatus",
            "kpiMissionHealthStatus"
        ],
        k.missionHealthStatus ||
        "Unknown"
    );


    setText(
        "missionHealthDescription",
        k.missionHealthDescription ||
        ""
    );


    updateMissionHealthClass(
        k.missionHealthStatus
    );


    /*
       Mission Trip KPIs
    */

    const missionData =
    Dashboard.missionData ||
    Dashboard.data?.missionTrips ||
    {};

const missionResponse =
    missionData.summary || {};

const mission =
    missionResponse.data || {};

setText(
    "kpiMissionTrips",
    formatNumber(
        mission.totalTrips || 0
    )
);

setText(
    "kpiTrippers",
    formatNumber(
        mission.uniqueMissionaries || 0
    )
);

setText(
    "kpiAvgTeam",
    formatNumber(
        mission.averageParticipants || 0
    )
);

    

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
        executive.title ||
        "Mission Intelligence"
    );


    renderList(
        "executiveOverview",
        executive.overview || []
    );


    const highlights =
        executive.highlights ||
        {};


    setTextMultiple(
        [
            "highlightTopChurch",
            "topChurch"
        ],
        highlights.topChurch ||
        "N/A"
    );


    setTextMultiple(
        [
            "highlightTopEvent",
            "topEvent"
        ],
        highlights.topEvent ||
        "N/A"
    );


    setTextMultiple(
        [
            "highlightTopReferral",
            "topReferral"
        ],
        highlights.topReferral ||
        "N/A"
    );


    setTextMultiple(
        [
            "highlightLatestEvent",
            "latestEvent"
        ],
        highlights.newestEvent ||
        highlights.latestEvent ||
        "N/A"
    );


    setTextMultiple(
        [
            "highlightMissionHealth",
            "missionHealth"
        ],
        highlights.missionHealth ||
        "N/A"
    );


    /*
       Pastor / strategic corner
    */

    renderStrategicCorner();

}


/* ==========================================================
   STRATEGIC CORNER
========================================================== */

function renderStrategicCorner() {

    const executive =
        Dashboard.data?.executive;

    const container =
        document.getElementById(
            "missionIntelligence"
        );


    if (
        !container ||
        !executive
    )
        return;


    /*
       Only render if executive health
       information exists.
    */

    if (
        executive.healthScore === undefined &&
        !executive.healthDescriptor &&
        !executive.topChurch &&
        !executive.topEvent
    )
        return;


    container.innerHTML = "";


    addPastorCard(
        container,
        "Mission Health",
        executive.healthScore !== undefined
            ? `${executive.healthScore}/100`
            : "N/A"
    );


    addPastorCard(
        container,
        "Mission Stage",
        executive.healthDescriptor ||
        "N/A"
    );


    addPastorCard(
        container,
        "Highest Participation",
        executive.topChurch ||
        "N/A"
    );


    addPastorCard(
        container,
        "Most Popular Event",
        executive.topEvent ||
        "N/A"
    );


    addPastorCard(
        container,
        "Repeat Missionaries",
        executive.repeatParticipants ??
        Dashboard.data?.kpis?.repeatParticipants ??
        0
    );

}


/* ==========================================================
   MISSION INSIGHTS
========================================================== */

function renderMissionInsights() {

    const insights =
        Dashboard.data
            ?.missionInsights ||
        {};


    renderInsightGroup(
        "celebrateInsights",
        insights.celebrate
    );


    renderInsightGroup(
        "insightCelebrate",
        insights.celebrate
    );


    renderInsightGroup(
        "warningInsights",
        insights.warning
    );


    renderInsightGroup(
        "insightWarning",
        insights.warning
    );


    renderInsightGroup(
        "followupInsights",
        insights.warning
    );


    renderInsightGroup(
        "recommendationInsights",
        insights.recommendation
    );


    renderInsightGroup(
        "insightRecommendation",
        insights.recommendation
    );


    renderInsightGroup(
        "opportunityInsights",
        insights.recommendation
    );


    renderInsightGroup(
        "riskInsights",
        insights.risk
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


    if (
        !Array.isArray(items) ||
        !items.length
    ) {

        container.innerHTML =
            `<div class="empty-state">
                No insights available.
             </div>`;

        return;

    }


    items.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "missionInsight insightItem";


            div.textContent =
                item;


            container.appendChild(
                div
            );

        }
    );

}


/* ==========================================================
   MISSION TRIP SUMMARY
========================================================== */



/* ==========================================================
   PARTICIPANT DATA
========================================================== */

function getParticipantRows() {

    return Dashboard.data
        ?.tables
        ?.participantSummary ||
        [];

}

/* ==========================================================
   PARTICIPANTS RENDERING
========================================================== */

function renderParticipants() {

    /*
       Compatibility wrapper.

       Participant directory rendering is handled by
       renderParticipantDirectory().

       Participant charts are handled separately by
       renderAllCharts().
    */

    /*
       Keep the filtered participant collection
       synchronised with the current dashboard data.
    */

    if (
        !Array.isArray(
            Dashboard.filteredParticipants
        ) ||
        Dashboard.filteredParticipants.length === 0
    ) {

        Dashboard.filteredParticipants =
            getParticipantRows();

    }

    /*
       Update participant result count.
    */

    updateFilterResultCount();

}
/* ==========================================================
   PARTICIPANT DIRECTORY
========================================================== */

function renderParticipantDirectory() {

    /*
       Support the IDs used by the different
       HTML versions.
    */

    const tbody =
        document.getElementById(
            "participantSummaryTable"
        ) ||
        document.getElementById(
            "participantTableBody"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    let people =
        Dashboard.filteredParticipants;


    if (
        !Array.isArray(people) ||
        !people.length
    ) {

        people =
            getParticipantRows();

    }


    /*
       Main participant table search
    */

    const searchElement =
        document.getElementById(
            "participantTableSearch"
        );


    const tableSearch =
        String(
            searchElement?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    if (tableSearch) {

        people =
            people.filter(
                person =>
                    participantMatchesSearch(
                        person,
                        tableSearch
                    )
            );

    }


    /*
       IMPORTANT:
       Participant directory is always
       sorted by NAME A-Z.
    */

    const sorted =
        [...people].sort(
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
                        sensitivity: "base"
                    }
                )
        );


    if (!sorted.length) {

        renderEmptyRow(
            tbody,
            7,
            "No participants found."
        );

        return;

    }


    sorted.forEach(
        person => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>

                    <button
                        type="button"
                        class="participant-link"
                    >
                        ${escapeHtml(
                            person.name ||
                            "Unnamed"
                        )}
                    </button>

                </td>

                <td>
                    ${escapeHtml(
                        person.church ||
                        "-"
                    )}
                </td>

                <td>
                    ${person.age ??
                    person.ageGroup ??
                    "-"}
                </td>

                <td>
                    ${formatNumber(
                        person.events ||
                        0
                    )}
                </td>

                <td>
                    ${Number(
                        person.attendanceRate ||
                        0
                    )}%
                </td>

                <td>
                    ${escapeHtml(
                        person.leadership ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        person.status ||
                        "-"
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
    person.personID ||
    person.personKey ||
    person.email ||
    person.mobile ||
    person.name
);

                    }
                );

            }


            /*
               Entire row clickable
            */

            tr.style.cursor =
                "pointer";


            tr.addEventListener(
                "click",
                () => {

                    openParticipantJourney(
    person.personID ||
    person.personKey ||
    person.email ||
    person.mobile ||
    person.name
);

                }
            );


            tbody.appendChild(
                tr
            );

        }
    );

}


/* ==========================================================
   PARTICIPANT SEARCH MATCH
========================================================== */

function participantMatchesSearch(
    person,
    search
) {

    return [

        person.name,

        person.church,

        person.mobile,

        person.email,

        person.leadership,

        person.status

    ]

    .filter(Boolean)

    .some(
        value =>
            String(value)
                .toLowerCase()
                .includes(search)
    );

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
        search.dataset.bound ===
        "true"
    )
        return;


    search.dataset.bound =
        "true";


    search.addEventListener(
        "input",
        debounce(
            () => {

                renderParticipantDirectory();

            },
            250
        )
    );

}


/* ==========================================================
   PARTICIPANT API SEARCH
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
        search.dataset.bound ===
        "true"
    )
        return;


    search.dataset.bound =
        "true";


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
                    ) {

                        throw new Error(
                            result?.message ||
                            "Participant search failed."
                        );

                    }


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

                        resultsContainer.innerHTML =
                            `<p>
                                ${escapeHtml(
                                    error.message
                                )}
                             </p>`;

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


    results.forEach(
        person => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


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
                        person.church ||
                        ""
                    )}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openParticipantJourney(
    person.personID ||
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

        }
    );

}


/* ==========================================================
   OPEN PARTICIPANT JOURNEY
========================================================== */

async function openParticipantJourney(identifier) {

  try {

    const response =
      await API.post(
        "getParticipantDetails",
        {
          identifier: identifier
        }
      );


    /*
     * Depending on your API wrapper,
     * response may already be the payload.
     */

    const result =
      response.data || response;


    if (!result.found) {

      alert("Participant not found.");

      return;

    }


    Dashboard.data.participantJourney =
      result;


    renderParticipantJourney(
      result
    );


  } catch (error) {

    console.error(
      "PARTICIPANT JOURNEY ERROR:",
      error
    );

    alert(
      "Unable to load participant journey."
    );

  }

}


/* ==========================================================
   PARTICIPANT JOURNEY SUMMARY
========================================================== */

function renderParticipantJourney(data) {

  if (!data || !data.found) {
    return;
  }


  const participant =
    data.participant || {};

  const summary =
    data.summary || {};

  const journal =
    data.journal || [];


  /*
   * ----------------------------------------------------------
   * BASIC INFORMATION
   * ----------------------------------------------------------
   */

  const name =
    participant.name || "—";

  const contact =
    participant.mobile ||
    participant.email ||
    "—";

  const church =
    participant.church || "—";


  /*
   * ----------------------------------------------------------
   * RENDER PROFILE
   * ----------------------------------------------------------
   */

  const nameElement =
    document.getElementById(
      "participantJourneyName"
    );

  const contactElement =
    document.getElementById(
      "participantJourneyContact"
    );

  const churchElement =
    document.getElementById(
      "participantJourneyChurch"
    );


  if (nameElement) {
    nameElement.textContent = name;
  }

  if (contactElement) {
    contactElement.textContent = contact;
  }

  if (churchElement) {
    churchElement.textContent = church;
  }


  /*
   * ----------------------------------------------------------
   * ENGAGEMENT SUMMARY
   * ----------------------------------------------------------
   */

  const missionElement =
    document.getElementById(
      "participantJourneyMissionTrips"
    );

  const eventsElement =
    document.getElementById(
      "participantJourneyEvents"
    );


  if (missionElement) {
    missionElement.textContent =
      summary.missionTrips || 0;
  }

  if (eventsElement) {
    eventsElement.textContent =
      summary.events || 0;
  }


  /*
   * ----------------------------------------------------------
   * CHRONOLOGICAL ENGAGEMENT
   * ----------------------------------------------------------
   */

  renderParticipantChronology(
    journal
  );


  /*
   * ----------------------------------------------------------
   * SHOW PANEL / MODAL
   * ----------------------------------------------------------
   */

  const panel =
    document.getElementById(
      "participantJourneyPanel"
    );

  if (panel) {
    panel.style.display = "";
  }

}

/* ==========================================================
   JOURNEY MODAL
========================================================== */

/* ==========================================================
   JOURNEY MODAL
========================================================== */

function renderJourneyModal(data) {

    const modal =
        document.getElementById("detailsModal") ||
        document.getElementById("participantJourneyModal");

    const title =
        document.getElementById("modalTitle");

    const body =
        document.getElementById("modalBody");

    if (!modal || !title || !body) {
        return;
    }

    /* ------------------------------------------------------
       PARTICIPANT NOT FOUND
    ------------------------------------------------------ */

    if (!data || data.found === false) {

        title.textContent =
            "Participant Not Found";

        body.innerHTML =
            "<p>No missional journey was found for this participant.</p>";

        showModalElement(modal);

        return;
    }


    /* ------------------------------------------------------
       DATA
    ------------------------------------------------------ */

    const person =
        data.person || {};

    const summary =
        data.summary || {};

    const journey =
        Array.isArray(data.journey)
            ? data.journey
            : [];


    /* ------------------------------------------------------
       TITLE
    ------------------------------------------------------ */

    title.textContent =
        "Missional Journey — " +
        (
            person.name ||
            "Participant"
        );


    /* ------------------------------------------------------
       SORT JOURNEY
    ------------------------------------------------------ */

    const sortedJourney =
        journey
            .slice()
            .sort(function(a, b) {

                const dateA =
                    new Date(a.date || 0);

                const dateB =
                    new Date(b.date || 0);

                return dateA - dateB;

            });


    /* ------------------------------------------------------
       BUILD JOURNEY ENTRIES
    ------------------------------------------------------ */

    let entries = "";


    sortedJourney.forEach(function(item) {

        const attended =
            item.attended === true ||
            item.attendance === true;


        const dateText =
            item.dateText ||
            formatDate(item.date);


        const eventTitle =
            item.title ||
            item.eventName ||
            "Mission engagement";


        const eventType =
            item.eventType ||
            item.type ||
            "";


        const description =
            item.description ||
            "";


        const location =
            item.location ||
            "";


        let entryHtml = "";


        entryHtml +=
            '<div class="journeyEntry">';


        entryHtml +=
            '<div class="journeyDate">' +
            escapeHtml(dateText) +
            '</div>';


        entryHtml +=
            '<div class="journeyContent">';


        entryHtml +=
            '<strong>' +
            escapeHtml(eventTitle) +
            '</strong>';


        if (eventType) {

            entryHtml +=
                '<span class="journeyType">' +
                escapeHtml(eventType) +
                '</span>';

        }


        if (description) {

            entryHtml +=
                '<p>' +
                escapeHtml(description) +
                '</p>';

        }


        if (location) {

            entryHtml +=
                '<small>' +
                escapeHtml(location) +
                '</small>';

        }


        entryHtml +=
            '<small>' +
            (
                attended
                    ? "Attended"
                    : "Registered"
            ) +
            '</small>';


        entryHtml +=
            '</div>';


        entryHtml +=
            '</div>';


        entries +=
            entryHtml;

    });


    /* ------------------------------------------------------
       EMPTY JOURNEY
    ------------------------------------------------------ */

    if (!entries) {

        entries =
            '<p>No journey entries.</p>';

    }


    /* ------------------------------------------------------
       PARTICIPANT HEADER
    ------------------------------------------------------ */

    let participantHeader = "";


    participantHeader +=
        '<div class="journeyParticipantHeader">';


    participantHeader +=
        '<h3>' +
        escapeHtml(
            person.name ||
            "Participant"
        ) +
        '</h3>';


    if (person.church) {

        participantHeader +=
            '<p>' +
            escapeHtml(
                person.church
            ) +
            '</p>';

    }


    participantHeader +=
        '</div>';


    /* ------------------------------------------------------
       JOURNEY SUMMARY
    ------------------------------------------------------ */

    const events =
        summary.events ?? 0;

    const attended =
        summary.attended ?? 0;

    const missionTrips =
        summary.missionTrips ?? 0;

    const totalJourneyEntries =
        summary.totalJourneyEntries ??
        journey.length;


    let summaryHtml = "";


    summaryHtml +=
        '<div class="journeySummary">';


    summaryHtml +=
        '<div>' +
        '<strong>' +
        escapeHtml(events) +
        '</strong>' +
        '<span>Events</span>' +
        '</div>';


    summaryHtml +=
        '<div>' +
        '<strong>' +
        escapeHtml(attended) +
        '</strong>' +
        '<span>Attended</span>' +
        '</div>';


    summaryHtml +=
        '<div>' +
        '<strong>' +
        escapeHtml(missionTrips) +
        '</strong>' +
        '<span>Mission Trips</span>' +
        '</div>';


    summaryHtml +=
        '<div>' +
        '<strong>' +
        escapeHtml(totalJourneyEntries) +
        '</strong>' +
        '<span>Journey Entries</span>' +
        '</div>';


    summaryHtml +=
        '</div>';


    /* ------------------------------------------------------
       FINAL MODAL CONTENT
    ------------------------------------------------------ */

    body.innerHTML =
        participantHeader +
        summaryHtml +
        '<div class="journeyTimeline">' +
        entries +
        '</div>';


    /* ------------------------------------------------------
       SHOW MODAL
    ------------------------------------------------------ */

    showModalElement(modal);

}


/* ==========================================================
   EVENT SUMMARY TABLE
========================================================== */

function renderEventSummaryTable() {

    const tbody =
        document.getElementById(
            "eventSummaryTableBody"
        ) ||
        document.getElementById(
            "eventSummaryTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const events =
        Dashboard.data
            ?.tables
            ?.eventSummary ||
        [];


    if (!events.length) {

        renderEmptyRow(
            tbody,
            10,
            "No event data available."
        );

        return;

    }


    events.forEach(
        event => {

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
                    ${formatNumber(
                        event.registered
                    )}
                </td>

                <td>
                    ${formatNumber(
                        event.attended
                    )}
                </td>

                <td>
                    ${Number(
                        event.attendance ||
                        0
                    )}%
                </td>

                <td>
                    ${formatNumber(
                        event.firstTimers
                    )}
                </td>

                <td>
                    ${formatNumber(
                        event.repeat
                    )}
                </td>

                <td>
                    ${formatNumber(
                        event.churches
                    )}
                </td>

                <td>

                    <span class="
                        status-badge
                        ${getStatusClass(
                            event.status
                        )}
                    ">
                        ${escapeHtml(
                            event.status ||
                            ""
                        )}
                    </span>

                </td>

            `;


            tr.style.cursor =
                "pointer";


            tr.addEventListener(
                "click",
                () =>
                    openEventDetails(
                        event.event
                    )
            );


            tbody.appendChild(
                tr
            );

        }
    );

}


/* ==========================================================
   EVENT RENDERING
========================================================== */

function renderEvent() {

    const events =
        Dashboard.data?.events;


    if (!events)
        return;


    setText(
        "averageAttendance",
        events.averages?.average ||
        0
    );

}


/* ==========================================================
   EVENT DETAILS
========================================================== */

async function openEventDetails(
    eventName
) {

    if (!eventName)
        return;


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
        ) {

            throw new Error(
                result?.message ||
                "Unable to load event details."
            );

        }


        showDetailsModal(
            eventName,
            result.data
        );

    }

    catch (error) {

        console.error(
            "EVENT DETAILS ERROR:",
            error
        );


        showError(
            error.message ||
            "Unable to load event details."
        );

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   CHURCH RENDERING
========================================================== */

function renderChurches() {

    /*
       Charts are rendered separately.
       This function exists so the dashboard
       can safely call it regardless of HTML
       version.
    */

    return;

}


/* ==========================================================
   LEADERSHIP RENDERING
========================================================== */

function renderLeadership() {

    /*
       Leadership charts are handled by
       renderLeadershipPipeline() and
       renderExperience().
    */

    return;

}


/* ==========================================================
   CHART REGISTRY
========================================================== */

function destroyChart(
    name
) {

    if (
        Dashboard.charts &&
        Dashboard.charts[name]
    ) {

        try {

            Dashboard.charts[
                name
            ].destroy();

        }

        catch (error) {

            console.warn(
                "Unable to destroy chart:",
                name,
                error
            );

        }

        delete Dashboard.charts[
            name
        ];

    }


    /*
       Backward-compatible registry
    */

    if (
        Dashboard.s &&
        Dashboard.s[name]
    ) {

        delete Dashboard.s[name];

    }

}


/* ==========================================================
   CREATE CHART
========================================================== */

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


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return null;

    }


    destroyChart(
        name
    );


    const chart =
        new Chart(
            canvas.getContext("2d"),
            config
        );


    Dashboard.charts[
        name
    ] = chart;


    Dashboard.s[
        name
    ] = chart;


    return chart;

}


/* ==========================================================
   STANDARD CHART OPTIONS
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

                beginAtZero:
                    beginAtZero

            }

        }

    };

}


/* ==========================================================
   RENDER ALL CHARTS
========================================================== */

function renderAllCharts() {

    renderFirstTimeReturning();

    renderAgeDistribution();

    renderChurchParticipation();

    renderChurchAttendance();

    renderChurchGrowth();

    renderEventPopularity();

    renderEventAttendance();

    renderMonthlyTrend();

    renderEventType();

    renderLeadershipPipeline();

    renderExperience();

    renderParticipantGrowth();

    renderParticipantType();

    renderParticipantEngagement();

}


/* ==========================================================
   FIRST TIME VS RETURNING
========================================================== */

function renderFirstTimeReturning() {

    const data =
        Dashboard.data
            ?.participants
            ?.firstTimeVsReturning;


    if (!data)
        return;


    createChart(
        "firstTimeReturning",
        "firstTimeReturning",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        data:
                            data.values || []

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio:
                    false

            }

        }
    );

}


/* ==========================================================
   AGE DISTRIBUTION
========================================================== */

function renderAgeDistribution() {

    const data =
        Dashboard.data
            ?.participants
            ?.ageDistribution;


    if (!data)
        return;


    createChart(
        "ageDistribution",
        "ageDistribution",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Participants",

                        data:
                            data.values || []

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   CHURCH PARTICIPATION
========================================================== */

function renderChurchParticipation() {

    const data =
        Dashboard.data
            ?.churches
            ?.participation;


    if (!data)
        return;


    createChart(
        "churchParticipation",
        "churchParticipation",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Participants",

                        data:
                            data.values || []

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   CHURCH ATTENDANCE
========================================================== */

function renderChurchAttendance() {

    const data =
        Dashboard.data
            ?.churches
            ?.attendance;


    if (!data)
        return;


    createChart(
        "churchAttendance",
        "churchAttendance",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Attendance %",

                        data:
                            data.values || []

                    }

                ]

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
   CHURCH GROWTH
========================================================== */

function renderChurchGrowth() {

    const data =
        Dashboard.data
            ?.churches
            ?.growth;


    if (!data)
        return;


    createChart(
        "churchGrowth",
        "churchGrowth",
        {

            type: "line",

            data: {

                labels:
                    data.labels ||
                    data.growthLabels ||
                    [],

                datasets: [

                    {

                        label:
                            "Churches",

                        data:
                            data.values ||
                            data.growthData ||
                            [],

                        tension:
                            0.3

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EVENT POPULARITY
========================================================== */

function renderEventPopularity() {

    const data =
        Dashboard.data
            ?.events
            ?.popularity;


    if (!data)
        return;


    createChart(
        "eventPopularity",
        "eventPopularity",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Registrations",

                        data:
                            data.values || []

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EVENT ATTENDANCE
========================================================== */

function renderEventAttendance() {

    const data =
        Dashboard.data
            ?.events
            ?.attendance;


    if (!data)
        return;


    createChart(
        "eventAttendance",
        "eventAttendance",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Attendance %",

                        data:
                            data.values || []

                    }

                ]

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

function renderMonthlyTrend() {

    const data =
        Dashboard.data
            ?.events
            ?.monthlyTrend;


    if (!data)
        return;


    createChart(
        "monthlyTrend",
        "monthlyTrend",
        {

            type: "line",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Registrations",

                        data:
                            data.values || [],

                        tension:
                            0.25

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EVENT TYPE
========================================================== */

function renderEventType() {

    const data =
        Dashboard.data
            ?.events
            ?.eventTypes;


    if (!data)
        return;


    createChart(
        "eventTypes",
        "eventType",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        data:
                            data.values || []

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio:
                    false

            }

        }
    );

}


/* ==========================================================
   LEADERSHIP PIPELINE
========================================================== */

function renderLeadershipPipeline() {

    const data =
        Dashboard.data
            ?.leadership
            ?.pipeline;


    if (!data)
        return;


    createChart(
        "leadershipPipeline",
        "leadershipPipeline",
        {

            type: "bar",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        label:
                            "Participants",

                        data:
                            data.values || []

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   EXPERIENCE
========================================================== */

function renderExperience() {

    const data =
        Dashboard.data
            ?.leadership
            ?.experience;


    if (!data)
        return;


    createChart(
        "experience",
        "experience",
        {

            type: "doughnut",

            data: {

                labels:
                    data.labels || [],

                datasets: [

                    {

                        data:
                            data.values || []

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio:
                    false

            }

        }
    );

}


/* ==========================================================
   PARTICIPANT GROWTH
========================================================== */

function renderParticipantGrowth() {

    const data =
        Dashboard.data
            ?.participants;


    if (!data)
        return;


    const labels =
        data.growthLabels ||
        data.growth?.labels ||
        [];


    const values =
        data.growthData ||
        data.growth?.values ||
        [];


    if (!labels.length)
        return;


    createChart(
        "participantGrowth",
        "participantGrowth",
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            "Participants",

                        data: values,

                        tension:
                            0.3

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   PARTICIPANT TYPE
========================================================== */

function renderParticipantType() {

    const data =
        Dashboard.data
            ?.participants;


    if (!data)
        return;


    const labels =
        data.typeLabels ||
        data.type?.labels ||
        [];


    const values =
        data.typeData ||
        data.type?.values ||
        [];


    if (!labels.length)
        return;


    createChart(
        "participantType",
        "participantType",
        {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [

                    {

                        data: values

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio:
                    false,

                plugins: {

                    legend: {

                        position:
                            "bottom"

                    }

                }

            }

        }
    );

}


/* ==========================================================
   PARTICIPANT ENGAGEMENT
========================================================== */

function renderParticipantEngagement() {

    const data =
        Dashboard.data
            ?.participants;


    if (!data)
        return;


    const labels =
        data.engagementLabels ||
        data.engagement?.labels ||
        [];


    const values =
        data.engagementData ||
        data.engagement?.values ||
        [];


    if (!labels.length)
        return;


    createChart(
        "participantEngagement",
        "participantEngagement",
        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            "Participants",

                        data: values

                    }

                ]

            },

            options:
                standardChartOptions()

        }
    );

}


/* ==========================================================
   FILTER INITIALISATION
========================================================== */

function initialiseFilters() {

    /*
       Build participant filters from
       participantSummary.
    */

    const participants =
        getParticipantRows();


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


    /*
       Event filter
    */

    populateFilter(
        "filterEvent",
        getEventNames(
            Dashboard.data
                ?.tables
                ?.eventSummary ||
            []
        ),
        "All Events"
    );


    /*
       Event type
    */

    populateFilter(
        "filterEventType",
        uniqueValues(
            Dashboard.data
                ?.tables
                ?.eventSummary ||
            [],
            "type"
        ),
        "All Event Types"
    );


    /*
       Year
    */

    const years =
        getEventYears();


    populateFilter(
        "filterYear",
        years,
        "All Years"
    );


    bindFilterControls();

}


/* ==========================================================
   FILTER CONTROLS
========================================================== */

function bindFilterControls() {

    const filterIds = [

        "filterYear",

        "filterChurch",

        "filterLeadership",

        "filterStatus",

        "filterEventType",

        "filterEvent"

    ];


    filterIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


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
                applyDashboardFilters
            );

        }
    );


    const reset =
        document.getElementById(
            "resetFilters"
        );


    if (
        reset &&
        reset.dataset.bound !==
            "true"
    ) {

        reset.dataset.bound =
            "true";


        reset.addEventListener(
            "click",
            resetDashboardFilters
        );

    }


    /*
       Participant table search
    */

    setupParticipantTableSearch();

    /*
       Main participant search
    */

    setupParticipantSearch();


    Dashboard.filtersBound =
        true;

}


/* ==========================================================
   APPLY DASHBOARD FILTERS
========================================================== */

function applyDashboardFilters() {

    const participants =
        getParticipantRows();


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


    const search =
        getFilterValue(
            "participantSearch"
        )
        .toLowerCase();


    /*
       Participant-level filters
    */

    Dashboard.filteredParticipants =
        participants.filter(
            person => {

                if (
                    church &&
                    String(
                        person.church ||
                        ""
                    ) !==
                    church
                )
                    return false;


                if (
                    leadership &&
                    String(
                        person.leadership ||
                        ""
                    ) !==
                    leadership
                )
                    return false;


                if (
                    status &&
                    String(
                        person.status ||
                        ""
                    ) !==
                    status
                )
                    return false;


                if (search) {

                    if (
                        !participantMatchesSearch(
                            person,
                            search
                        )
                    )
                        return false;

                }


                return true;

            }
        );


    /*
       Event filter is applied to
       participant directory only when
       event history is available.
    */

    const event =
        getFilterValue(
            "filterEvent"
        );


    if (event) {

        const eventParticipants =
            getParticipantsForEvent(
                event
            );


        if (
            eventParticipants.length
        ) {

            const allowed =
                new Set(
                    eventParticipants.map(
                        getPersonKey
                    )
                );


            Dashboard.filteredParticipants =
                Dashboard.filteredParticipants
                    .filter(
                        person =>
                            allowed.has(
                                getPersonKey(
                                    person
                                )
                            )
                    );

        }

    }


    renderParticipantDirectory();

    updateFilterResultCount();

}


/* ==========================================================
   GET PARTICIPANTS FOR EVENT
========================================================== */

function getParticipantsForEvent(
    eventName
) {

    const rows =
        Dashboard.rawData ||
        Dashboard.data?.rows ||
        [];


    if (!Array.isArray(rows))
        return [];


    return rows.filter(
        row =>
            String(
                row.eventName ||
                row.event ||
                ""
            )
            .toLowerCase() ===
            String(
                eventName
            )
            .toLowerCase()
    );

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetDashboardFilters() {

    [

        "filterYear",

        "filterChurch",

        "filterLeadership",

        "filterStatus",

        "filterEventType",

        "filterEvent",

        "participantSearch",

        "participantTableSearch"

    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element)
                element.value = "";

        }
    );


    const results =
        document.getElementById(
            "participantSearchResults"
        );


    if (results)
        results.innerHTML =
            "";


    Dashboard.filteredParticipants =
        getParticipantRows();


    renderDashboard();

    updateFilterResultCount();

}


/* ==========================================================
   FILTER RESULT COUNT
========================================================== */

function updateFilterResultCount() {

    const count =
        Dashboard.filteredParticipants
            ?.length ||
        getParticipantRows().length;


    setText(
        "participantResultCount",
        `${formatNumber(
            count
        )} participants`
    );

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


    const current =
        select.value;


    select.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        defaultLabel;


    select.appendChild(
        defaultOption
    );


    values
        .filter(Boolean)
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
        )
        .forEach(
            value => {

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

            }
        );


    if (
        values.includes(
            current
        )
    ) {

        select.value =
            current;

    }

}


/* ==========================================================
   GET EVENT YEARS
========================================================== */

function getEventYears() {

    const events =
        Dashboard.data
            ?.tables
            ?.eventSummary ||
        [];


    return [
        ...new Set(
            events
                .map(
                    event =>
                        getYear(
                            event.date
                        )
                )
                .filter(Boolean)
        )
    ]
    .sort(
        (a, b) =>
            Number(a) -
            Number(b)
    );

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
                .map(
                    row =>
                        row?.[field]
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
                .map(
                    row =>
                        row.event ||
                        row.eventName
                )
                .filter(Boolean)
        )
    ];

}


/* ==========================================================
   FILTER VALUE
========================================================== */

function getFilterValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return String(
        element?.value ||
        ""
    )
    .trim();

}


/* ==========================================================
   PARTICIPANT IDENTIFIER
========================================================== */

function getPersonKey(
    person
) {

    return String(
        person?.personKey ||
        person?.email ||
        person?.mobile ||
        person?.name ||
        ""
    )
    .trim()
    .toLowerCase();

}


/* ==========================================================
   MODAL — JOURNEY
========================================================== */

function showModalElement(
    modal
) {

    if (!modal)
        return;


    modal.classList.remove(
        "hidden"
    );


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* ==========================================================
   DETAILS MODAL
========================================================== */

function showDetailsModal(
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
        title ||
        "Details";


    body.innerHTML = `

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


    showModalElement(
        modal
    );

}


/* ==========================================================
   OPEN MODAL
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


    showModalElement(
        modal
    );

}


/* ==========================================================
   CLOSE MODAL
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


    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ==========================================================
   BIND MODALS
========================================================== */

function bindModalControls() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            button => {

                if (
                    button.dataset.bound ===
                    "true"
                )
                    return;


                button.dataset.bound =
                    "true";


                button.addEventListener(
                    "click",
                    function () {

                        closeModal(
                            this.dataset
                                .closeModal
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(
            modal => {

                if (
                    modal.dataset.bound ===
                    "true"
                )
                    return;


                modal.dataset.bound =
                    "true";


                modal.addEventListener(
                    "click",
                    event => {

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

            }
        );


    /*
       Common participant modal close
    */

    const closeParticipant =
        document.getElementById(
            "closeParticipantJourney"
        );


    if (
        closeParticipant &&
        closeParticipant.dataset.bound !==
            "true"
    ) {

        closeParticipant.dataset.bound =
            "true";


        closeParticipant.addEventListener(
            "click",
            () => {

                closeModal(
                    "participantJourneyModal"
                );

                closeModal(
                    "detailsModal"
                );

            }
        );

    }

}


/* ==========================================================
   DASHBOARD UI
========================================================== */

function bindDashboardUI() {

    if (
        Dashboard.uiBound
    )
        return;


    bindModalControls();


    const refresh =
        document.getElementById(
            "refreshDashboard"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            refreshDashboard
        );

    }


    Dashboard.uiBound =
        true;

}


/* ==========================================================
   MISSION HEALTH CLASS
========================================================== */

function updateMissionHealthClass(
    status
) {

    const elements = [

        document.getElementById(
            "missionHealthStatus"
        ),

        document.getElementById(
            "kpiMissionHealthStatus"
        )

    ]
    .filter(Boolean);


    elements.forEach(
        element => {

            element.classList.remove(

                "health-excellent",

                "health-healthy",

                "health-growing",

                "health-attention",

                "health-critical",

                "excellent",

                "healthy",

                "growing",

                "needs-attention",

                "critical"

            );


            const value =
                String(
                    status ||
                    ""
                )
                .toLowerCase();


            switch(value) {

                case "excellent":

                    element.classList.add(
                        "health-excellent",
                        "excellent"
                    );

                    break;


                case "healthy":

                    element.classList.add(
                        "health-healthy",
                        "healthy"
                    );

                    break;


                case "growing":

                    element.classList.add(
                        "health-growing",
                        "growing"
                    );

                    break;


                case "needs attention":

                    element.classList.add(
                        "health-attention",
                        "needs-attention"
                    );

                    break;


                case "critical":

                    element.classList.add(
                        "health-critical",
                        "critical"
                    );

                    break;

            }

        }
    );

}


/* ==========================================================
   PASTOR CARD
========================================================== */

function addPastorCard(
    container,
    title,
    value
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "pastorCard";


    card.innerHTML = `

        <div class="pastorTitle">
            ${escapeHtml(
                title
            )}
        </div>

        <div class="pastorValue">
            ${escapeHtml(
                value
            )}
        </div>

    `;


    container.appendChild(
        card
    );

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


    container.innerHTML =
        "";


    if (
        !Array.isArray(items) ||
        !items.length
    )
        return;


    items.forEach(
        item => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                item;


            container.appendChild(
                li
            );

        }
    );

}


/* ==========================================================
   SET TEXT
========================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element)
        return;


    element.textContent =
        value ??
        "";

}


/* ==========================================================
   SET MULTIPLE TEXT ELEMENTS
========================================================== */

function setTextMultiple(
    ids,
    value
) {

    ids.forEach(
        id =>
            setText(
                id,
                value
            )
    );

}


/* ==========================================================
   NUMBER FORMAT
========================================================== */

function formatNumber(
    value
) {

    const number =
        Number(
            value || 0
        );


    if (
        Number.isNaN(
            number
        )
    )
        return "0";


    return number.toLocaleString(
        "en-SG"
    );

}


/* ==========================================================
   GROWTH FORMAT
========================================================== */

function formatGrowth(
    value
) {

    const number =
        Number(
            value || 0
        );


    if (
        Number.isNaN(
            number
        )
    )
        return "0%";


    if (
        number > 0
    )
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
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return String(
            value
        );


    return date.toLocaleDateString(
        "en-SG",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


/* ==========================================================
   YEAR
========================================================== */

function getYear(
    value
) {

    if (!value)
        return "";


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return "";


    return String(
        date.getFullYear()
    );

}


/* ==========================================================
   STATUS CLASS
========================================================== */

function getStatusClass(
    status
) {

    return String(
        status ||
        ""
    )
    .toLowerCase()
    .replace(
        /[^a-z0-9]+/g,
        "-"
    )
    .replace(
        /^-|-$/g,
        ""
    );

}


/* ==========================================================
   EMPTY TABLE ROW
========================================================== */

function renderEmptyRow(
    tbody,
    colspan,
    message
) {

    const tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td
            colspan="${colspan}"
            style="text-align:center;"
        >
            ${escapeHtml(
                message
            )}
        </td>

    `;


    tbody.appendChild(
        tr
    );

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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
   LOADING
========================================================== */

function showLoading() {

    const ids = [

        "loadingOverlay",

        "dashboardLoading"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element)
                element.classList.remove(
                    "hidden"
                );

        }
    );

}


/* ==========================================================
   HIDE LOADING
========================================================== */

function hideLoading() {

    const ids = [

        "loadingOverlay",

        "dashboardLoading"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element)
                element.classList.add(
                    "hidden"
                );

        }
    );

}


/* ==========================================================
   ERROR
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


    if (!element) {

        console.error(
            "Dashboard error element not found:",
            message
        );

        return;

    }


    element.textContent =
        message ||
        "Unable to load dashboard.";


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
   LAST REFRESH
========================================================== */

function updateLastRefresh() {

    const element =
        document.getElementById(
            "lastRefresh"
        );


    if (!element)
        return;


    element.textContent =
        new Date()
            .toLocaleString(
                "en-SG"
            );

}


/* ==========================================================
   BACK BUTTON
========================================================== */

function goBack() {

    history.back();

}


/* ==========================================================
   GLOBAL DASHBOARD READY
========================================================== */

function dashboardReady() {

    clearError();

    updateLastRefresh();

    updateFilterResultCount();

    console.log(
        "Missions Intelligence Dashboard ready."
    );

}


/* ==========================================================
   COMPATIBILITY ALIASES
========================================================== */

/*
   These aliases allow existing HTML onclick
   handlers or older code to continue working.
*/

function refreshFilteredDashboard() {

    applyDashboardFilters();

}


function setupFilters() {

    initialiseFilters();

}


function setupParticipantSearchLegacy() {

    setupParticipantSearch();

}

/* ==========================================================
   MISSION TRIP SUMMARY BY LOCATION
========================================================== */

function renderMissionTripLocationSummary() {

    const tbody =
        document.getElementById(
            "missionTripLocationSummaryTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const summary =
    Dashboard.data
        ?.missionTrips
        ?.summary
        ?.data
        ?.missionTripLocationSummary || [];

console.log("MISSION TRIP LOCATION SUMMARY:", summary);


    if (!summary.length) {

        renderEmptyRow(
            tbody,
            3,
            "No mission trip location data available."
        );

        return;

    }


    summary.forEach(
        location => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        location.location ||
                        "-"
                    )}
                </td>

                <td>
                    ${formatNumber(
                        location.trips ||
                        0
                    )}
                </td>

                <td>
                    ${formatNumber(
                        location.totalParticipants ||
                        0
                    )}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}

/* ==========================================================
   EVENT TOP LINES
========================================================== */

/* ==========================================================
   EVENT TOP LINES BY EVENT TYPE
========================================================== */

/* ==========================================================
   EVENT TOP LINES
========================================================== */

/* ==========================================================
   EVENT TOP LINES
   Group events by Event Type
========================================================== */

function renderEventTopLines() {

    console.log(
        "=== RENDER EVENT TOP LINES ==="
    );


    const tbody =
        document.getElementById(
            "eventTopLinesTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    /*
       ------------------------------------------------------
       SOURCE DATA
       ------------------------------------------------------
    */

    const topLines =
        Dashboard.data
            ?.tables
            ?.eventTopLines ||
        [];


    console.log(
        "RAW EVENT TOP LINES:",
        topLines
    );


    if (!topLines.length) {

        renderEmptyRow(
            tbody,
            3,
            "No event data available."
        );

        return;

    }


    /*
       ------------------------------------------------------
       GROUP BY EVENT TYPE
       ------------------------------------------------------
    */

    const grouped = {};


    topLines.forEach(
        event => {

            const eventType =
                String(
                    event.eventType ||
                    event.type ||
                    "Unknown"
                )
                .trim();


            if (!grouped[eventType]) {

                grouped[eventType] = {

                    eventType:
                        eventType,

                    registered:
                        0,

                    attended:
                        0

                };

            }


            grouped[eventType].registered +=
                Number(
                    event.registered ||
                    event.totalRegistered ||
                    0
                );


            grouped[eventType].attended +=
                Number(
                    event.attended ||
                    event.totalAttended ||
                    0
                );

        }
    );


    /*
       ------------------------------------------------------
       CONVERT TO ARRAY
       ------------------------------------------------------
    */

    const summary =
        Object.values(
            grouped
        );


    console.log(
        "GROUPED EVENT TOP LINES:",
        summary
    );


    /*
       ------------------------------------------------------
       SORT A-Z BY EVENT TYPE
       ------------------------------------------------------
    */

    summary.sort(
        (a, b) =>
            a.eventType.localeCompare(
                b.eventType,
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )
    );


    /*
       ------------------------------------------------------
       RENDER
       ------------------------------------------------------
    */

    summary.forEach(
        event => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        event.eventType
                    )}
                </td>

                <td>
                    ${formatNumber(
                        event.registered
                    )}
                </td>

                <td>
                    ${formatNumber(
                        event.attended
                    )}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}

/* ==========================================================
   LOAD UNIQUE PARTICIPANTS
   ========================================================== */

async function loadUnifiedParticipants() {

    try {

        console.log(
            "Loading unified participants..."
        );


        const result =
            await API.post(
                "getUnifiedParticipants",
                {}
            );


        console.log(
            "Unified participants result:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "Failed to load unified participants:",
                result
            );

            return;

        }


        /*
         * Backend returns:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         */

        const participants =
            result.data || [];


        /*
         * Store in dashboard state
         */

        Dashboard.data =
            Dashboard.data || {};

        Dashboard.data.participants =
            participants;


        console.log(
            "Unique participants:",
            participants.length
        );


        console.table(
            participants
        );


        /*
         * Render later
         *
         * For now this only loads the data.
         */

        return participants;


    } catch (error) {

        console.error(
            "Error loading unified participants:",
            error
        );

        return [];

    }

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

    const trips =
        Dashboard.missionData
            ?.summary
            ?.trips ||
        Dashboard.data
            ?.missionTrips
            ?.summary
            ?.trips ||
        [];

    if (!trips.length) {

        renderEmptyRow(
            tbody,
            4,
            "No mission trip data available."
        );

        return;

    }


    trips.forEach(
        trip => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        trip.tripName ||
                        trip.tripCode ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
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
                    ${formatNumber(
                        trip.participants ||
                        0
                    )}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}

function renderParticipantChronology(journal) {

  const tbody =
    document.getElementById(
      "participantJourneyTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (!journal || !journal.length) {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td colspan="4" class="empty-state">
        No chronological engagement found.
      </td>
    `;

    tbody.appendChild(row);

    return;

  }


  journal.forEach(entry => {

    const row =
      document.createElement("tr");


    /*
     * DATE
     */

    const date =
      entry.displayDate ||
      formatParticipantJourneyDate(
        entry.date
      ) ||
      "—";


    /*
     * EVENT / TRIP
     */

    const eventOrTrip =
      entry.eventOrTrip ||
      "—";


    /*
     * DESCRIPTION
     */

    const description =
      entry.description ||
      "—";


    /*
     * LOCATION
     */

    const location =
      entry.location ||
      "—";


    row.innerHTML = `

      <td>
        ${escapeHtml(date)}
      </td>

      <td>
        ${escapeHtml(eventOrTrip)}
      </td>

      <td>
        ${escapeHtml(description)}
      </td>

      <td>
        ${escapeHtml(location)}
      </td>

    `;


    tbody.appendChild(row);

  });

}

function formatParticipantJourneyDate(value) {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}
