/******************************************************************
 *
 * reports.js
 * PART 1
 * Initialisation + KPI Dashboard
 *
 ******************************************************************/

let analytics = {};
let dashboardLoaded = false;

/******************************************************************
 * GOOGLE APPS SCRIPT EXECUTION API
 ******************************************************************/
async function runScript(functionName, parameters = []) {

    const response = await fetch(
        `https://script.googleapis.com/v1/scripts/${CONFIG.SCRIPT_ID}:run`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + await getAccessToken()
            },
            body: JSON.stringify({
                function: functionName,
                parameters: parameters,
                devMode: false
            })
        }
    );

    const result = await response.json();

    console.log(functionName, result);

    if (result.error) {

        throw new Error(

            result.error.details?.[0]?.errorMessage ||

            result.error.message

        );

    }

    return result.response.result;

}

/******************************************************************
 * PAGE LOAD
 ******************************************************************/
window.onload = async function () {

    try {

        showLoading();

        await loadDashboard();

        hideLoading();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

};

/******************************************************************
 * LOAD EVERYTHING
 ******************************************************************/
async function loadDashboard() {

    analytics = await runScript(
        "getMissionAnalytics",
        []
    );

    console.log(analytics);

    renderKPIs();

renderExecutiveSummary();

renderTimelineChart();

renderEventTypeChart();

renderChurchChart();

  renderExecutiveCharts();

    dashboardLoaded = true;

}

/******************************************************************
 * LOADING
 ******************************************************************/
function showLoading() {

    const div = document.getElementById("loading");

    if (div) {

        div.style.display = "block";

    }

}

function hideLoading() {

    const div = document.getElementById("loading");

    if (div) {

        div.style.display = "none";

    }

}

/******************************************************************
 * KPI CARDS
 ******************************************************************/
function renderKPIs() {

    const kpi = analytics.kpi;

    if (!kpi) return;

    setCardValue("kpiRegistrations", kpi.totalRegistrations);

    setCardValue("kpiParticipants", kpi.totalParticipants);

    setCardValue("kpiEvents", kpi.totalEvents);

    setCardValue("kpiChurches", kpi.totalChurches);

    setCardValue("kpiAttendance", kpi.totalAttendance);

    setCardValue(
        "kpiAttendanceRate",
        kpi.attendanceRate + "%"
    );

}

/******************************************************************
 * EXECUTIVE SUMMARY
 ******************************************************************/
function renderExecutiveSummary() {

    if (!analytics.kpi) return;

    const k = analytics.kpi;

    const summary =

`During the selected reporting period, Missions organised ${k.totalEvents} events, receiving ${k.totalRegistrations} registrations from ${k.totalParticipants} unique participants across ${k.totalChurches} churches.

Attendance rate stands at ${k.attendanceRate}% with ${k.totalAttendance} recorded attendances.

The charts below provide deeper insights into participation trends, demographics, repeat attendance and event engagement.`;

    const div = document.getElementById(
        "executiveSummary"
    );

    if (div) {

        div.innerHTML = summary;

    }

}

/******************************************************************
 * SMALL HELPER
 ******************************************************************/
function setCardValue(id, value) {

    const div = document.getElementById(id);

    if (!div) return;

    div.innerHTML = value;

}

/******************************************************************
 * NUMBER FORMAT
 ******************************************************************/
function formatNumber(number) {

    if (number == null) return "0";

    return Number(number).toLocaleString();

}

/******************************************************************
 * PERCENT FORMAT
 ******************************************************************/
function formatPercent(number) {

    if (number == null) return "0%";

    return Number(number).toFixed(1) + "%";

}

/******************************************************************
 * DATE FORMAT
 ******************************************************************/
function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-SG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}

/******************************************************************
 * REFRESH BUTTON
 ******************************************************************/
async function refreshDashboard() {

    dashboardLoaded = false;

    showLoading();

    analytics = {};

    await loadDashboard();

    hideLoading();

}

/******************************************************************
 * EXPORT PLACEHOLDER
 ******************************************************************/
function exportCSV() {

    alert(
        "CSV Export will be added in Part 5."
    );

}

/******************************************************************
 * PRINT DASHBOARD
 ******************************************************************/
function printDashboard() {

    window.print();

}


/******************************************************************
 *
 * reports.js
 * PART 2
 * Charts
 *
 ******************************************************************/

let timelineChart = null;
let eventTypeChart = null;
let churchChart = null;

/******************************************************************
 * UPDATE loadDashboard()
 ******************************************************************/

// Add these lines AFTER renderExecutiveSummary()

// renderTimelineChart();
// renderEventTypeChart();
// renderChurchChart();

/******************************************************************
 * PARTICIPANTS OVER TIME
 ******************************************************************/

function renderTimelineChart() {

    if (!analytics.timeline) return;

    const labels = analytics.timeline.map(r => r.month);

    const registrations = analytics.timeline.map(r => r.registrations);

    const attendance = analytics.timeline.map(r => r.attendance);

    if (timelineChart) {

        timelineChart.destroy();

    }

    timelineChart = new Chart(

        document.getElementById("timelineChart"),

        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Registrations",

                        data: registrations

                    },

                    {

                        label: "Attendance",

                        data: attendance

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    intersect: false,

                    mode: "index"

                },

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }

    );

}

/******************************************************************
 * EVENT TYPE BREAKDOWN
 ******************************************************************/

function renderEventTypeChart() {

    if (!analytics.eventTypes) return;

    const labels = analytics.eventTypes.map(r => r.eventType);

    const registrations = analytics.eventTypes.map(r => r.registrations);

    const attendance = analytics.eventTypes.map(r => r.attendance);

    if (eventTypeChart) {

        eventTypeChart.destroy();

    }

    eventTypeChart = new Chart(

        document.getElementById("eventTypeChart"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Registrations",

                        data: registrations

                    },

                    {

                        label: "Attendance",

                        data: attendance

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

/******************************************************************
 * CHURCH DEMOGRAPHICS
 ******************************************************************/

function renderChurchChart() {

    if (!analytics.churches) return;

    const labels = analytics.churches.map(r => r.church);

    const values = analytics.churches.map(

        r => r.uniqueParticipants

    );

    if (churchChart) {

        churchChart.destroy();

    }

    churchChart = new Chart(

        document.getElementById("churchChart"),

        {

            type: "pie",

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

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "right"

                    }

                }

            }

        }

    );

}

/******************************************************************
 * REDRAW AFTER REFRESH
 ******************************************************************/

function redrawCharts() {

    renderTimelineChart();

    renderEventTypeChart();

    renderChurchChart();

}

/******************************************************************
 * MODIFY refreshDashboard()
 ******************************************************************/

// After loadDashboard()
// add:

// redrawCharts();

/******************************************************************
 *
 * reports.js
 * PART 3
 * Executive Charts
 *
 ******************************************************************/

let ageChart = null;
let repeatChart = null;
let growthChart = null;
let popularityChart = null;
let attendanceRateChart = null;

/******************************************************************
 * AGE DISTRIBUTION
 ******************************************************************/
function renderAgeChart() {

    if (!analytics.ageDistribution) return;

    const labels = analytics.ageDistribution.map(r => r.ageGroup);
    const values = analytics.ageDistribution.map(r => r.participants);

    if (ageChart) ageChart.destroy();

    ageChart = new Chart(

        document.getElementById("ageChart"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Participants",

                        data: values

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        }

    );

}

/******************************************************************
 * REPEAT ATTENDANCE
 ******************************************************************/
function renderRepeatAttendanceChart() {

    if (!analytics.repeatAttendance) return;

    const labels = analytics.repeatAttendance.map(r => r.category);
    const values = analytics.repeatAttendance.map(r => r.participants);

    if (repeatChart) repeatChart.destroy();

    repeatChart = new Chart(

        document.getElementById("repeatChart"),

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

/******************************************************************
 * MONTHLY GROWTH
 ******************************************************************/
function renderGrowthChart() {

    if (!analytics.monthlyGrowth) return;

    const labels = analytics.monthlyGrowth.map(r => r.month);
    const values = analytics.monthlyGrowth.map(r => r.participants);

    if (growthChart) growthChart.destroy();

    growthChart = new Chart(

        document.getElementById("growthChart"),

        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Participants",

                        data: values

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}

/******************************************************************
 * TOP EVENTS
 ******************************************************************/
function renderPopularityChart() {

    if (!analytics.eventPopularity) return;

    const top = analytics.eventPopularity.slice(0, 10);

    const labels = top.map(r => r.event);

    const registrations = top.map(r => r.registrations);

    const attendance = top.map(r => r.attendance);

    if (popularityChart) popularityChart.destroy();

    popularityChart = new Chart(

        document.getElementById("popularityChart"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Registrations",

                        data: registrations

                    },

                    {

                        label: "Attendance",

                        data: attendance

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                indexAxis: "y"

            }

        }

    );

}

/******************************************************************
 * ATTENDANCE RATE
 ******************************************************************/
function renderAttendanceRateChart() {

    if (!analytics.attendanceRate) return;

    const labels = analytics.attendanceRate.map(r => r.eventType);

    const values = analytics.attendanceRate.map(r => r.rate);

    if (attendanceRateChart) attendanceRateChart.destroy();

    attendanceRateChart = new Chart(

        document.getElementById("attendanceRateChart"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Attendance %",

                        data: values

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        min: 0,

                        max: 100

                    }

                }

            }

        }

    );

}

/******************************************************************
 * DRAW ALL EXECUTIVE CHARTS
 ******************************************************************/
function renderExecutiveCharts() {

    renderAgeChart();

    renderRepeatAttendanceChart();

    renderGrowthChart();

    renderPopularityChart();

    renderAttendanceRateChart();

}
