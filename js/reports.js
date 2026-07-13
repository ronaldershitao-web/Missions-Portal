/* ==========================================================
   COOS Missions Portal
   Mission Intelligence Dashboard
   reports.js
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL DASHBOARD OBJECT
========================================================== */

const Dashboard = {

    headers: [],
    rawData: [],
    participants: [],
    events: [],
    churches: [],
    referrals: [],

    filteredData: [],

    metrics: {},
    charts: {},

    filters: {
        year: "",
        eventType: "",
        church: "",
        referral: "",
        attendance: "",
        search: ""
    }

};

/* ==========================================================
   COLUMN INDEXES
========================================================== */

let COL = {};

/* ==========================================================
   INITIALISE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialiseDashboard
);

async function initialiseDashboard() {

    try {

        showLoading();

        await loadMasterResponses();

        buildColumnIndexes();

        processRawData();

        populateFilters();

        refreshDashboard();

        hideLoading();

        document.getElementById("lastRefresh").textContent =
            new Date().toLocaleString();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        alert(err.message);

    }

}

/* ==========================================================
   LOAD DATA
========================================================== */

async function loadMasterResponses() {

    const result = await API.post(
        "getMasterResponses"
    );

    if (!result.success)
        throw new Error(result.message);

    Dashboard.headers = result.data.headers;

    Dashboard.rawData = result.data.rows;

}

/* ==========================================================
   BUILD COLUMN MAP
========================================================== */

function buildColumnIndexes() {

    Dashboard.headers.forEach((header, index) => {

        COL[
            String(header).trim()
        ] = index;

    });

}

/* ==========================================================
   PROCESS RAW DATA
========================================================== */

function processRawData() {

    Dashboard.participants = [];

    Dashboard.events = [];

    Dashboard.churches = [];

    Dashboard.referrals = [];

    Dashboard.rawData.forEach(processRow);

}

/* ==========================================================
   PROCESS ONE ROW
========================================================== */

function processRow(row) {

    Dashboard.participants.push({

        importTimestamp:
            value(row, "Import Timestamp"),

        sourceSpreadsheet:
            value(row, "Source Spreadsheet ID"),

        sourceSheet:
            value(row, "Source Sheet"),

        eventDate:
            parseDate(
                value(row, "Event Date")
            ),

        eventName:
            value(row, "Event Name"),

        eventType:
            value(row, "Event Type"),

        submissionTimestamp:
            parseDate(
                value(row, "Submission Timestamp")
            ),

        name:
            value(row, "Name"),

        email:
            cleanEmail(
                value(row, "Email")
            ),

        mobile:
            value(row, "Mobile"),

        church:
            cleanChurch(
                value(row, "Church")
            ),

        dob:
            value(row, "DOB"),

        age:
            parseNumber(
                value(row, "Age")
            ),

        referral:
            value(row, "Referral"),

        status:
            value(row, "Status"),

        reminders:
            value(row, "Reminders"),

        attendance:
            value(row, "Attendance"),

        responseKey:
            value(row, "Response Key")

    });

}

/* ==========================================================
   REFRESH DASHBOARD
========================================================== */

function refreshDashboard() {

    readFilters();

    applyFilters();

    calculateMetrics();

    renderDashboard();

}

/* ==========================================================
   READ FILTERS
========================================================== */

function readFilters() {

    Dashboard.filters.year =
        document.getElementById("yearFilter").value;

    Dashboard.filters.eventType =
        document.getElementById("eventTypeFilter").value;

    Dashboard.filters.church =
        document.getElementById("churchFilter").value;

    Dashboard.filters.referral =
        document.getElementById("referralFilter").value;

    Dashboard.filters.attendance =
        document.getElementById("attendanceFilter").value;

    Dashboard.filters.search =
        document.getElementById("searchBox")
            .value
            .trim()
            .toLowerCase();

}

/* ==========================================================
   APPLY FILTERS
========================================================== */

function applyFilters() {

    Dashboard.filteredData =
        Dashboard.participants.filter(matchesFilters);

}

/* ==========================================================
   FILTER LOGIC
========================================================== */

function matchesFilters(person) {

    if (
        Dashboard.filters.year &&
        String(person.eventDate?.getFullYear()) !== Dashboard.filters.year
    )
        return false;

    if (
        Dashboard.filters.eventType &&
        person.eventType !== Dashboard.filters.eventType
    )
        return false;

    if (
        Dashboard.filters.church &&
        person.church !== Dashboard.filters.church
    )
        return false;

    if (
        Dashboard.filters.referral &&
        person.referral !== Dashboard.filters.referral
    )
        return false;

    if (
        Dashboard.filters.attendance &&
        person.attendance !== Dashboard.filters.attendance
    )
        return false;

    if (Dashboard.filters.search) {

        const search = Dashboard.filters.search;

        const found =

            person.name.toLowerCase().includes(search) ||

            person.email.toLowerCase().includes(search) ||

            person.church.toLowerCase().includes(search);

        if (!found)
            return false;

    }

    return true;

}

/* ==========================================================
   CALCULATE ALL METRICS
========================================================== */

function calculateMetrics() {

    const data = Dashboard.filteredData;

    Dashboard.metrics = {

        registrations: data.length,

        uniqueParticipants: 0,

        repeatParticipants: 0,

        totalEvents: 0,

        totalChurches: 0,

        attendanceRate: 0,

        averageAge: 0,

        medianAge: 0,

        ageGroups: {},

        participantMap: new Map(),

        eventMap: new Map(),

        churchMap: new Map(),

        referralMap: new Map()

    };

    calculateParticipantMetrics(data);

    calculateEventMetrics(data);

    calculateChurchMetrics(data);

    calculateReferralMetrics(data);

    calculateAttendanceMetrics(data);

    calculateAgeMetrics(data);

}

/* ==========================================================
   PARTICIPANT METRICS
========================================================== */

function calculateParticipantMetrics(data) {

    const people = Dashboard.metrics.participantMap;

    data.forEach(person => {

        const email =
            person.email ||
            person.name;

        if (!people.has(email)) {

            people.set(email, {

                name: person.name,

                email: person.email,

                church: person.church,

                age: person.age,

                registrations: 0,

                attended: 0,

                firstEvent: person.eventDate,

                latestEvent: person.eventDate,

                events: []

            });

        }

        const p = people.get(email);

        p.registrations++;

        if (
            isPresent(person)
        ) {

            p.attended++;

        }

        p.events.push(person);

        if (
            person.eventDate &&
            (!p.firstEvent ||
             person.eventDate < p.firstEvent)
        ) {

            p.firstEvent =
                person.eventDate;

        }

        if (
            person.eventDate &&
            (!p.latestEvent ||
             person.eventDate > p.latestEvent)
        ) {

            p.latestEvent =
                person.eventDate;

        }

    });

    Dashboard.metrics.uniqueParticipants =
        people.size;

    Dashboard.metrics.repeatParticipants =
        [...people.values()]
        .filter(p => p.registrations > 1)
        .length;

}

/* ==========================================================
   EVENT METRICS
========================================================== */

function calculateEventMetrics(data) {

    const events =
        Dashboard.metrics.eventMap;

    data.forEach(person => {

        const key =

            person.eventName +
            "|" +
            formatDate(person.eventDate);

        if (!events.has(key)) {

            events.set(key, {

                eventName: person.eventName,

                eventDate: person.eventDate,

                eventType: person.eventType,

                registrations: 0,

                attended: 0,

                churches: new Set(),

                participants: new Set()

            });

        }

        const e =
            events.get(key);

        e.registrations++;

        if (
            isPresent(person)
        ) {

            e.attended++;

        }

        if (person.church) {

            e.churches.add(
                person.church
            );

        }

        if (person.email) {

            e.participants.add(
                person.email
            );

        }

    });

    Dashboard.metrics.totalEvents =
        events.size;

}

/* ==========================================================
   CHURCH METRICS
========================================================== */

function calculateChurchMetrics(data) {

    const churches =
        Dashboard.metrics.churchMap;

    data.forEach(person => {

        const church =
            person.church ||
            "Unknown";

        if (!churches.has(church)) {

            churches.set(church, {

                church: church,

                registrations: 0,

                attended: 0,

                participants: new Set(),

                events: new Set()

            });

        }

        const c =
            churches.get(church);

        c.registrations++;

        if (
            isPresent(person)
        ) {

            c.attended++;

        }

        if (person.email) {

            c.participants.add(
                person.email
            );

        }

        c.events.add(
            person.eventName
        );

    });

    Dashboard.metrics.totalChurches =
        churches.size;

}

/* ==========================================================
   REFERRAL METRICS
========================================================== */

function calculateReferralMetrics(data) {

    const referrals =
        Dashboard.metrics.referralMap;

    data.forEach(person => {

        const source =
            person.referral ||
            "Unknown";

        if (!referrals.has(source)) {

            referrals.set(source, {

                source: source,

                registrations: 0,

                attended: 0

            });

        }

        const r =
            referrals.get(source);

        r.registrations++;

        if (
            isPresent(person)
        ) {

            r.attended++;

        }

    });

}

/* ==========================================================
   ATTENDANCE METRICS
========================================================== */

function calculateAttendanceMetrics(data) {

    if (data.length === 0) {

        Dashboard.metrics.attendanceRate = 0;

        return;

    }

    const attended =

        data.filter(
            isPresent
        ).length;

    Dashboard.metrics.attendanceRate =

        Math.round(
            attended /
            data.length *
            100
        );

}

/* ==========================================================
   AGE METRICS
========================================================== */

function calculateAgeMetrics(data) {

    const ages =

        data

        .map(p => Number(p.age))

        .filter(a => !isNaN(a) && a > 0)

        .sort((a,b)=>a-b);

    if (ages.length === 0) {

        Dashboard.metrics.averageAge = 0;

        Dashboard.metrics.medianAge = 0;

        Dashboard.metrics.ageGroups = {};

        return;

    }

    Dashboard.metrics.averageAge =

        Math.round(

            ages.reduce(

                (a,b)=>a+b,

                0

            ) / ages.length

        );

    Dashboard.metrics.medianAge =

        ages[
            Math.floor(
                ages.length / 2
            )
        ];

    Dashboard.metrics.ageGroups = {

        "<18":0,

        "18-25":0,

        "26-35":0,

        "36-45":0,

        "46-55":0,

        "56-65":0,

        "65+":0

    };

    ages.forEach(age=>{

        if(age<18)
            Dashboard.metrics.ageGroups["<18"]++;

        else if(age<=25)
            Dashboard.metrics.ageGroups["18-25"]++;

        else if(age<=35)
            Dashboard.metrics.ageGroups["26-35"]++;

        else if(age<=45)
            Dashboard.metrics.ageGroups["36-45"]++;

        else if(age<=55)
            Dashboard.metrics.ageGroups["46-55"]++;

        else if(age<=65)
            Dashboard.metrics.ageGroups["56-65"]++;

        else
            Dashboard.metrics.ageGroups["65+"]++;

    });

}

/* ==========================================================
   ADVANCED METRICS
========================================================== */

function calculateAdvancedMetrics() {

    calculateGrowthMetrics();

    calculateReferralMetricsAdvanced();

    calculateJourneyMetrics();

    calculateDataQuality();

    calculateMissionHealthScore();

}

/* ==========================================================
   GROWTH METRICS
========================================================== */

function calculateGrowthMetrics() {

    const monthly = {};

    Dashboard.filteredData.forEach(person => {

        if (!person.eventDate) return;

        const key =
            person.eventDate.getFullYear() +
            "-" +
            String(person.eventDate.getMonth()+1).padStart(2,"0");

        monthly[key] =
            (monthly[key] || 0) + 1;

    });

    Dashboard.metrics.monthlyRegistrations = monthly;

    const months =
        Object.values(monthly);

    if (months.length < 2) {

        Dashboard.metrics.growthRate = 0;

        return;

    }

    const latest = months[months.length-1];
    const previous = months[months.length-2];

    if (previous === 0) {

        Dashboard.metrics.growthRate = 100;

    } else {

        Dashboard.metrics.growthRate =
            Math.round(
                ((latest-previous)/previous)*100
            );

    }

}

/* ==========================================================
   REFERRAL EFFECTIVENESS
========================================================== */

function calculateReferralMetricsAdvanced() {

    let largest = "";
    let count = 0;

    Dashboard.metrics.referralMap.forEach(r => {

        if (r.registrations > count) {

            largest = r.source;
            count = r.registrations;

        }

    });

    Dashboard.metrics.topReferral = largest;

    Dashboard.metrics.topReferralCount = count;

}

/* ==========================================================
   PARTICIPANT JOURNEY
========================================================== */

function calculateJourneyMetrics() {

    let firstTimers = 0;
    let returning = 0;

    Dashboard.metrics.participantMap.forEach(person => {

        if (person.registrations === 1)
            firstTimers++;

        else
            returning++;

    });

    Dashboard.metrics.firstTimers =
        firstTimers;

    Dashboard.metrics.returningParticipants =
        returning;

}

/* ==========================================================
   DATA QUALITY
========================================================== */

function calculateDataQuality() {

    const rows =
        Dashboard.filteredData;

    let complete = 0;

    rows.forEach(p => {

        if (

            p.name &&
            p.email &&
            p.church &&
            p.eventName &&
            p.eventDate

        ) {

            complete++;

        }

    });

    Dashboard.metrics.dataQuality =

        rows.length === 0

        ? 0

        : Math.round(
            complete /
            rows.length *
            100
        );

}

/* ==========================================================
   MISSION HEALTH SCORE
========================================================== */

function calculateMissionHealthScore() {

    const attendance =
        Dashboard.metrics.attendanceRate;

    const repeat =
        Dashboard.metrics.uniqueParticipants === 0

        ? 0

        : Dashboard.metrics.repeatParticipants /
          Dashboard.metrics.uniqueParticipants *
          100;

    const churches =

        Math.min(
            Dashboard.metrics.totalChurches * 5,
            100
        );

    const avgParticipants =

        Dashboard.metrics.totalEvents === 0

        ? 0

        : Dashboard.metrics.registrations /
          Dashboard.metrics.totalEvents;

    const eventHealth =

        Math.min(
            avgParticipants * 4,
            100
        );

    const referralHealth =

        Dashboard.metrics.topReferralCount === 0

        ? 0

        : Math.min(

            Dashboard.metrics.topReferralCount /
            Dashboard.metrics.registrations *
            300,

            100

        );

    const dataQuality =
        Dashboard.metrics.dataQuality;

    const score =

          attendance * 0.30
        + repeat * 0.25
        + churches * 0.15
        + eventHealth * 0.10
        + referralHealth * 0.10
        + dataQuality * 0.10;

    Dashboard.metrics.missionHealthScore =
        Math.round(score);

    if (score >= 90)
        Dashboard.metrics.healthStatus = "Excellent";

    else if (score >= 75)
        Dashboard.metrics.healthStatus = "Healthy";

    else if (score >= 60)
        Dashboard.metrics.healthStatus = "Growing";

    else if (score >= 40)
        Dashboard.metrics.healthStatus = "Needs Attention";

    else
        Dashboard.metrics.healthStatus = "Critical";

}

/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */

function generateExecutiveSummary() {

    const m = Dashboard.metrics;

    const summary = [];

    summary.push(

        `The Missions Department organised <strong>${m.totalEvents}</strong> events with <strong>${m.registrations}</strong> registrations representing <strong>${m.uniqueParticipants}</strong> unique participants from <strong>${m.totalChurches}</strong> churches.`

    );

    summary.push(

        `Overall attendance was <strong>${m.attendanceRate}%</strong>, while <strong>${m.repeatParticipants}</strong> participants returned for more than one Missions event.`

    );

    summary.push(

        `${m.firstTimers} participants attended a Missions event for the first time.`

    );

    summary.push(

        `Average participant age was <strong>${m.averageAge}</strong> years.`

    );

    summary.push(

        `The strongest recruitment source was <strong>${m.topReferral || "Unknown"}</strong>.`

    );

    summary.push(

        `Mission Health Score is <strong>${m.missionHealthScore}/100 (${m.healthStatus})</strong>.`

    );

    document.getElementById(
        "executiveSummary"
    ).innerHTML =

        "<ul><li>" +

        summary.join("</li><li>") +

        "</li></ul>";

}

/* ==========================================================
   MISSION INTELLIGENCE
========================================================== */

function generateMissionIntelligence() {

    generateCelebrate();

    generateFollowup();

    generateOpportunities();

    generateRisks();

}

/* ==========================================================
   CELEBRATE
========================================================== */

function generateCelebrate() {

    const m = Dashboard.metrics;

    const list = [];

    if (m.attendanceRate >= 90)

        list.push(
            `Attendance is excellent at ${m.attendanceRate}%.`
        );

    if (m.repeatParticipants > 0)

        list.push(
            `${m.repeatParticipants} participants returned for another Missions event.`
        );

    if (m.totalChurches >= 10)

        list.push(
            `${m.totalChurches} churches are actively participating.`
        );

    if (m.growthRate > 0)

        list.push(
            `Registrations grew ${m.growthRate}% from the previous month.`
        );

    if (list.length === 0)

        list.push(
            "No significant highlights this reporting period."
        );

    renderInsightList(
        "celebrateInsights",
        list
    );

}

/* ==========================================================
   FOLLOW-UP
========================================================== */

function generateFollowup() {

    const m = Dashboard.metrics;

    const list = [];

    if (m.attendanceRate < 75)

        list.push(
            "Attendance has dropped below the desired ministry benchmark."
        );

    if (m.repeatParticipants < m.uniqueParticipants * 0.30)

        list.push(
            "Participant retention is low. Review follow-up after events."
        );

    if (m.totalChurches < 5)

        list.push(
            "Only a small number of churches are represented."
        );

    if (m.dataQuality < 90)

        list.push(
            "Several participant records are incomplete."
        );

    if (list.length === 0)

        list.push(
            "No immediate pastoral concerns detected."
        );

    renderInsightList(
        "followupInsights",
        list
    );

}

/* ==========================================================
   OPPORTUNITIES
========================================================== */

function generateOpportunities() {

    const m = Dashboard.metrics;

    const list = [];

    if (m.firstTimers > 0)

        list.push(
            `${m.firstTimers} first-time participants can be invited to future missions events.`
        );

    if (m.topReferral)

        list.push(
            `Continue investing in '${m.topReferral}' as the primary recruitment channel.`
        );

    if (m.averageAge > 0)

        list.push(
            `Average participant age is ${m.averageAge}. Consider age-specific mobilisation strategies.`
        );

    if (list.length === 0)

        list.push(
            "No major growth opportunities identified."
        );

    renderInsightList(
        "opportunityInsights",
        list
    );

}

/* ==========================================================
   RISKS
========================================================== */

function generateRisks() {

    const m = Dashboard.metrics;

    const list = [];

    if (m.missionHealthScore < 60)

        list.push(
            "Mission Health Score indicates ministry requires strategic review."
        );

    if (m.growthRate < 0)

        list.push(
            "Registrations are declining month-over-month."
        );

    if (m.dataQuality < 80)

        list.push(
            "Poor data quality may affect ministry planning."
        );

    if (list.length === 0)

        list.push(
            "No major operational risks detected."
        );

    renderInsightList(
        "riskInsights",
        list
    );

}

/* ==========================================================
   RENDER INSIGHT LIST
========================================================== */

function renderInsightList(id, items) {

    document.getElementById(id).innerHTML =

        "<ul><li>" +

        items.join("</li><li>") +

        "</li></ul>";

}

/* ==========================================================
   RENDER DASHBOARD
========================================================== */

function renderDashboard() {

    renderKPIs();

    renderMissionHealth();

    generateExecutiveSummary();

    generateMissionIntelligence();

}

/* ==========================================================
   KPI CARDS
========================================================== */

function renderKPIs() {

    const m = Dashboard.metrics;

    setText("kpiRegistrations", number(m.registrations));

    setText("kpiUnique", number(m.uniqueParticipants));

    setText("kpiRepeat", number(m.repeatParticipants));

    setText("kpiEvents", number(m.totalEvents));

    setText("kpiChurches", number(m.totalChurches));

    setText("kpiAttendance", percent(m.attendanceRate));

    setText("kpiGrowth", growth(m.growthRate));

}

/* ==========================================================
   MISSION HEALTH SCORE
========================================================== */

function renderMissionHealth() {

    const m = Dashboard.metrics;

    setText(
        "missionHealthScore",
        m.missionHealthScore
    );

    setText(
        "missionHealthStatus",
        m.healthStatus
    );

    setText(
        "missionHealthDescription",
        getMissionHealthDescription(
            m.healthStatus
        )
    );

    updateMissionHealthColour(
        m.healthStatus
    );

}

/* ==========================================================
   MISSION HEALTH DESCRIPTION
========================================================== */

function getMissionHealthDescription(status){

    switch(status){

        case "Excellent":

            return "The Missions Ministry is flourishing. Participation, engagement and attendance are consistently strong across churches.";

        case "Healthy":

            return "The ministry is healthy and growing. Continue strengthening follow-up and church mobilisation.";

        case "Growing":

            return "The ministry is moving in a positive direction but there are opportunities to improve retention and engagement.";

        case "Needs Attention":

            return "Several ministry indicators require pastoral attention. Review attendance, follow-up and recruitment strategies.";

        case "Critical":

            return "Mission engagement has declined significantly. Immediate strategic intervention is recommended.";

        default:

            return "-";

    }

}

/* ==========================================================
   MISSION HEALTH COLOUR
========================================================== */

function updateMissionHealthColour(status){

    const card = document.getElementById(
        "missionHealthCard"
    );

    if(!card) return;

    card.className = "healthCard";

    switch(status){

        case "Excellent":

            card.classList.add(
                "excellent"
            );

            break;

        case "Healthy":

            card.classList.add(
                "healthy"
            );

            break;

        case "Growing":

            card.classList.add(
                "growing"
            );

            break;

        case "Needs Attention":

            card.classList.add(
                "warning"
            );

            break;

        default:

            card.classList.add(
                "critical"
            );

    }

}

/* ==========================================================
   HELPER FUNCTIONS
========================================================== */

function setText(id,value){

    const el=document.getElementById(id);

    if(!el) return;

    el.textContent=value;

}

function number(value){

    return Number(value||0).toLocaleString();

}

function percent(value){

    return `${Math.round(value||0)}%`;

}

function growth(value){

    value=Number(value||0);

    if(value>0)
        return `▲ ${value}%`;

    if(value<0)
        return `▼ ${Math.abs(value)}%`;

    return "0%";

}


/* ==========================================================
   REGISTRATION TREND
========================================================== */

function renderRegistrationTrendChart() {

    const monthly = getMonthlyRegistrations();

    const labels = Object.keys(monthly);

    const values = Object.values(monthly);

    destroyChart("registrationTrendChart");

    Dashboard.charts.registrationTrendChart =
        new Chart(

            document
                .getElementById("registrationTrendChart")
                .getContext("2d"),

            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Registrations",

                            data: values,

                            borderWidth: 3,

                            tension: 0.35,

                            fill: true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            mode: "index"

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

/* ==========================================================
   MONTHLY REGISTRATIONS
========================================================== */

function getMonthlyRegistrations() {

    const months = {};

    Dashboard.filteredData.forEach(person => {

        if (!person.eventDate) return;

        const d = person.eventDate;

        const key =

            d.getFullYear() +

            "-" +

            String(

                d.getMonth() + 1

            ).padStart(2, "0");

        months[key] =

            (months[key] || 0) + 1;

    });

    return sortMonthlyObject(months);

}

/* ==========================================================
   SORT MONTHLY OBJECT
========================================================== */

function sortMonthlyObject(obj) {

    return Object

        .keys(obj)

        .sort()

        .reduce((result, key) => {

            result[key] = obj[key];

            return result;

        }, {});

}

/* ==========================================================
   REFRESH CHART
========================================================== */

function renderGrowthSection() {

    renderRegistrationTrendChart();

}

/* ==========================================================
   MONTHLY GROWTH CHART
========================================================== */

function renderMonthlyGrowthChart() {

    const monthly = getMonthlyRegistrations();

    const labels = Object.keys(monthly);

    const registrations = Object.values(monthly);

    const growth = calculateMonthlyGrowth(registrations);

    destroyChart("monthlyGrowthChart");

    Dashboard.charts.monthlyGrowthChart =
        new Chart(

            document
                .getElementById("monthlyGrowthChart")
                .getContext("2d"),

            {

                data: {

                    labels: labels,

                    datasets: [

                        {

                            type: "bar",

                            label: "Registrations",

                            data: registrations,

                            yAxisID: "y",

                            borderWidth: 1

                        },

                        {

                            type: "line",

                            label: "Growth %",

                            data: growth,

                            yAxisID: "y1",

                            tension: 0.35,

                            borderWidth: 3,

                            pointRadius: 4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false

                    },

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            title: {

                                display: true,

                                text: "Registrations"

                            }

                        },

                        y1: {

                            position: "right",

                            grid: {

                                drawOnChartArea: false

                            },

                            title: {

                                display: true,

                                text: "Growth %"

                            }

                        }

                    }

                }

            }

        );

}

/* ==========================================================
   CALCULATE MONTHLY GROWTH
========================================================== */

function calculateMonthlyGrowth(values) {

    const growth = [];

    values.forEach((current, index) => {

        if (index === 0) {

            growth.push(0);

            return;

        }

        const previous = values[index - 1];

        if (previous === 0) {

            growth.push(100);

            return;

        }

        growth.push(

            Number(

                (

                    (current - previous)

                    / previous

                    * 100

                ).toFixed(1)

            )

        );

    });

    return growth;

}

/* ==========================================================
   REFRESH GROWTH CHARTS
========================================================== */

function renderGrowthSection() {

    renderRegistrationTrendChart();

    renderMonthlyGrowthChart();

}

/* ==========================================================
   CHART HELPERS
========================================================== */

/* ----------------------------------------------------------
   Destroy Existing Chart
---------------------------------------------------------- */

function destroyChart(chartName) {

    if (Dashboard.charts[chartName]) {

        Dashboard.charts[chartName].destroy();

        Dashboard.charts[chartName] = null;

    }

}

/* ----------------------------------------------------------
   Common Chart Options
---------------------------------------------------------- */

function defaultChartOptions() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 700

        },

        interaction: {

            mode: "index",

            intersect: false

        },

        plugins: {

            legend: {

                display: true,

                position: "bottom"

            },

            tooltip: {

                enabled: true

            }

        }

    };

}

/* ----------------------------------------------------------
   Merge Chart Options
---------------------------------------------------------- */

function chartOptions(extra = {}) {

    return {

        ...defaultChartOptions(),

        ...extra

    };

}

/* ==========================================================
   COLOUR PALETTE
========================================================== */

const Colours = {

    blue: "#2563eb",

    green: "#16a34a",

    orange: "#ea580c",

    red: "#dc2626",

    yellow: "#facc15",

    teal: "#0891b2",

    purple: "#7c3aed",

    pink: "#db2777",

    grey: "#6b7280",

    lightBlue: "#93c5fd",

    lightGreen: "#86efac",

    lightOrange: "#fdba74",

    lightRed: "#fca5a5"

};

/* ==========================================================
   RANDOM COLOURS
========================================================== */

function generateColours(count) {

    const palette = [

        Colours.blue,

        Colours.green,

        Colours.orange,

        Colours.red,

        Colours.purple,

        Colours.teal,

        Colours.yellow,

        Colours.pink,

        Colours.lightBlue,

        Colours.lightGreen,

        Colours.lightOrange,

        Colours.lightRed

    ];

    const colours = [];

    for (let i = 0; i < count; i++) {

        colours.push(

            palette[i % palette.length]

        );

    }

    return colours;

}

/* ==========================================================
   LABEL HELPERS
========================================================== */

function monthLabel(date) {

    if (!date)

        return "";

    return date.toLocaleString(

        "default",

        {

            month: "short",

            year: "2-digit"

        }

    );

}

function formatPercentage(value) {

    return `${Math.round(value)}%`;

}

function formatNumber(value) {

    return Number(value || 0).toLocaleString();

}

/* ==========================================================
   CHART DATA HELPERS
========================================================== */

function sortObject(object) {

    return Object

        .keys(object)

        .sort()

        .reduce((result, key) => {

            result[key] = object[key];

            return result;

        }, {});

}

function mapToLabels(map) {

    return [...map.keys()];

}

function mapToValues(map) {

    return [...map.values()];

}

/* ==========================================================
   EMPTY CHART PLACEHOLDER
========================================================== */

function renderEmptyChart(canvasId, message = "No data available") {

    destroyChart(canvasId);

    const ctx = document
        .getElementById(canvasId)
        ?.getContext("2d");

    if (!ctx) return;

    Dashboard.charts[canvasId] = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [message],

            datasets: [

                {

                    data: [0]

                }

            ]

        },

        options: {

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    display: false

                },

                y: {

                    display: false

                }

            }

        }

    });

}





