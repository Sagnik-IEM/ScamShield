/**
 * ScamShield Frontend Application Logic
 * Communicates with FastAPI backend for message scanning, transaction simulation,
 * community threat reporting, and interactive fusion weight tuning.
 */

const API_BASE = window.location.origin.includes(":8000") || window.location.origin.includes(":3000")
    ? window.location.origin
    : "http://localhost:8000";

// Preset test scenarios
const PRESETS = {
    bofa: {
        text: "CRITICAL ALERT: Your Bank of America debit card has been suspended due to suspected fraud. Re-activate your card now at http://bofa-card-reactivate.xyz/login immediately.",
        urls: "http://bofa-card-reactivate.xyz/login"
    },
    irs: {
        text: "IRS Final Notice: An arrest warrant has been issued against your SSN for unpaid tax liabilities. Call 800-555-0199 immediately or pay via direct deposit at http://irs-tax-refund.top",
        urls: "http://irs-tax-refund.top"
    },
    lottery: {
        text: "CONGRATULATIONS! You have been selected as the $1,000,000 winner of the 2026 Global Promo. Claim your cash prize now at http://win-lottery-gift.xyz",
        urls: "http://win-lottery-gift.xyz"
    },
    safe: {
        text: "Hi Alex, can you review the project notes and slide deck attached before our client meeting at 3 PM today? Thanks!",
        urls: ""
    },
    crypto: {
        text: "Coinbase Security Alert: A withdrawal request for 0.45 BTC is pending. If this was not you, cancel immediately at http://coinbase-auth-protect.top",
        urls: "http://coinbase-auth-protect.top"
    }
};

let lastScannedData = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initPresetButtons();
    initMessageScanner();
    initTransactionSimulator();
    initCommunityFeed();
    initFusionTuner();
    checkBackendHealth();
});

// Toast notification helper
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// -------------------------------------------------------------------------
// Tab Navigation
// -------------------------------------------------------------------------
function initNavigation() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            const targetId = `view-${tab.dataset.tab}`;
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add("active");

            if (tab.dataset.tab === "community-feed") {
                loadCommunityReports();
            }
        });
    });
}

// Backend Health Check
async function checkBackendHealth() {
    const statusLabel = document.getElementById("api-status-text");
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
            statusLabel.textContent = "Backend Active";
            statusLabel.parentElement.style.color = "var(--safe)";
        } else {
            statusLabel.textContent = "Service Degraded";
        }
    } catch (e) {
        statusLabel.textContent = "Backend Offline";
        statusLabel.parentElement.style.color = "var(--danger)";
    }
}

// -------------------------------------------------------------------------
// Preset Buttons
// -------------------------------------------------------------------------
function initPresetButtons() {
    const presetBtns = document.querySelectorAll(".btn-preset");
    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.preset;
            if (PRESETS[key]) {
                document.getElementById("input-message-text").value = PRESETS[key].text;
                document.getElementById("input-urls").value = PRESETS[key].urls;
                showToast(`Loaded preset: ${btn.textContent}`, "info");
            }
        });
    });

    document.getElementById("btn-clear-message").addEventListener("click", () => {
        document.getElementById("input-message-text").value = "";
        document.getElementById("input-urls").value = "";
        document.getElementById("results-active-state").classList.add("hidden");
        document.getElementById("results-empty-state").classList.remove("hidden");
        const badge = document.getElementById("badge-verdict");
        badge.className = "verdict-pill verdict-idle";
        badge.textContent = "Ready for Input";
    });
}

// -------------------------------------------------------------------------
// Message & Link Scanner
// -------------------------------------------------------------------------
function initMessageScanner() {
    const form = document.getElementById("form-scan-message");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = document.getElementById("input-message-text").value.trim();
        const rawUrls = document.getElementById("input-urls").value.trim();

        if (!text) {
            showToast("Please enter message content to scan.", "error");
            return;
        }

        const scanBtn = document.getElementById("btn-run-scan");
        const originalText = scanBtn.innerHTML;
        scanBtn.disabled = true;
        scanBtn.innerHTML = "<span>Analyzing Multi-Modal Risk...</span>";

        try {
            const payload = { message: text };
            if (rawUrls) {
                payload.urls = rawUrls.split(",").map(u => u.trim()).filter(Boolean);
            }

            const res = await fetch(`${API_BASE}/check-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Scanning failed");
            }

            const data = await res.json();
            lastScannedData = { text, data };
            renderMessageResults(data);
            showToast("Message & URL analysis complete!", "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerHTML = originalText;
        }
    });

    // Quick report button inside scan results
    document.getElementById("btn-quick-report").addEventListener("click", () => {
        if (!lastScannedData) return;
        // Switch to community tab and prepopulate form
        document.getElementById("tab-community").click();
        document.getElementById("report-content").value = lastScannedData.text;
        document.getElementById("report-risk-score").value = Math.round(lastScannedData.data.overall_score);
        document.getElementById("report-reason").value = lastScannedData.data.reasons.slice(0, 2).join("; ") || "ScamShield flagged high risk";
        showToast("Scam details copied to report form!", "info");
    });
}

function renderMessageResults(data) {
    document.getElementById("results-empty-state").classList.add("hidden");
    const activeState = document.getElementById("results-active-state");
    activeState.classList.remove("hidden");

    const verdict = data.verdict;
    const score = Math.round(data.overall_score);

    // Top Header Badge
    const headerBadge = document.getElementById("badge-verdict");
    headerBadge.className = `verdict-pill verdict-${verdict.toLowerCase()}`;
    headerBadge.textContent = verdict;

    // Score Ring
    const scoreRing = document.getElementById("verdict-score-ring");
    document.getElementById("val-overall-score").textContent = score;

    let ringColor = "var(--safe)";
    let ringGlow = "var(--safe-glow)";
    if (verdict === "Suspicious") {
        ringColor = "var(--warning)";
        ringGlow = "var(--warning-glow)";
    } else if (verdict === "Dangerous") {
        ringColor = "var(--danger)";
        ringGlow = "var(--danger-glow)";
    }
    scoreRing.style.borderColor = ringColor;
    scoreRing.style.boxShadow = `0 0 20px ${ringGlow}`;

    // Verdict Hero Info
    const titleEl = document.getElementById("val-verdict-title");
    titleEl.textContent = verdict;
    titleEl.style.color = ringColor;

    document.getElementById("val-confidence").textContent = `Confidence: ${(data.confidence * 100).toFixed(0)}%`;
    
    let descText = "Safe: No critical indicators detected.";
    if (verdict === "Suspicious") descText = "Suspicious: Urgency or unknown domain markers require vigilance.";
    if (verdict === "Dangerous") descText = "DANGEROUS: Severe phishing / lookalike domain indicators detected!";
    document.getElementById("val-verdict-desc").textContent = descText;

    document.getElementById("val-fusion-formula").textContent = 
        `Weights: (Text: ${data.text_risk.score} × 0.55) + (URL: ${data.url_risk.score} × 0.45) = ${data.overall_score}`;

    // Text Risk Card
    const textLabelBadge = document.getElementById("badge-text-label");
    textLabelBadge.textContent = `${data.text_risk.score} / 100 (${data.text_risk.label})`;
    textLabelBadge.style.color = getScoreColor(data.text_risk.score);
    const textBar = document.getElementById("bar-text-score");
    textBar.style.width = `${data.text_risk.score}%`;
    textBar.style.backgroundColor = getScoreColor(data.text_risk.score);

    const featContainer = document.getElementById("list-text-features");
    featContainer.innerHTML = "";
    if (data.text_risk.top_features && data.text_risk.top_features.length > 0) {
        data.text_risk.top_features.forEach(f => {
            const span = document.createElement("span");
            span.className = "feat-tag";
            span.textContent = `"${f}"`;
            featContainer.appendChild(span);
        });
    }

    // URL Risk Card
    const urlLabelBadge = document.getElementById("badge-url-label");
    urlLabelBadge.textContent = `${data.url_risk.score} / 100 (${data.url_risk.label})`;
    urlLabelBadge.style.color = getScoreColor(data.url_risk.score);
    const urlBar = document.getElementById("bar-url-score");
    urlBar.style.width = `${data.url_risk.score}%`;
    urlBar.style.backgroundColor = getScoreColor(data.url_risk.score);

    const urlDetailsContainer = document.getElementById("list-url-details");
    urlDetailsContainer.innerHTML = "";
    if (data.url_risk.domain_details && data.url_risk.domain_details.length > 0) {
        data.url_risk.domain_details.forEach(d => {
            const div = document.createElement("div");
            div.className = "url-item";
            div.innerHTML = `<strong>${d.domain}</strong>: ${d.is_lookalike ? `🚨 Brand Impersonation (${d.target_brand})` : 'Standard Host'} | Score: ${d.score}`;
            urlDetailsContainer.appendChild(div);
        });
    } else {
        urlDetailsContainer.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-dim);">No URLs in message</span>`;
    }

    // Explanatory Reasons List
    const reasonsList = document.getElementById("list-reasons");
    reasonsList.innerHTML = "";
    data.reasons.forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        reasonsList.appendChild(li);
    });
}

function getScoreColor(score) {
    if (score < 40) return "var(--safe)";
    if (score < 75) return "var(--warning)";
    return "var(--danger)";
}

// -------------------------------------------------------------------------
// Transaction Fraud Simulator
// -------------------------------------------------------------------------
function initTransactionSimulator() {
    // Quick Amount Chips
    const chips = document.querySelectorAll(".chip-btn");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            document.getElementById("input-amount").value = chip.dataset.amt;
        });
    });

    const form = document.getElementById("form-scan-transaction");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payee = document.getElementById("input-payee").value.trim();
        const amount = parseFloat(document.getElementById("input-amount").value);
        const channel = document.getElementById("input-channel").value;
        const timestamp = document.getElementById("input-time").value;
        const isFirstTime = document.getElementById("check-first-time").checked;
        const notes = document.getElementById("input-notes").value.trim();

        if (!payee || isNaN(amount) || amount <= 0) {
            showToast("Please provide valid payee and positive amount.", "error");
            return;
        }

        const btn = document.getElementById("btn-check-txn");
        btn.disabled = true;
        btn.innerHTML = "<span>Evaluating Payment Rules...</span>";

        try {
            const res = await fetch(`${API_BASE}/check-transaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payee,
                    amount,
                    account_type: channel,
                    timestamp,
                    is_first_time: isFirstTime,
                    notes: notes || null
                })
            });

            if (!res.ok) throw new Error("Transaction assessment failed");
            const data = await res.json();
            renderTransactionResults(data, channel);
            showToast("Transaction fraud evaluation complete!", "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = "<span>Evaluate Transaction Risk</span>";
        }
    });
}

function renderTransactionResults(data, channel) {
    document.getElementById("txn-empty-state").classList.add("hidden");
    document.getElementById("txn-active-state").classList.remove("hidden");

    const verdict = data.verdict;
    const score = data.risk_score;

    const badge = document.getElementById("badge-txn-verdict");
    badge.className = `verdict-pill verdict-${verdict.toLowerCase()}`;
    badge.textContent = verdict;

    document.getElementById("val-txn-score").textContent = score;
    const ring = document.getElementById("txn-score-ring");
    const color = getScoreColor(score);
    ring.style.borderColor = color;
    ring.style.boxShadow = `0 0 20px ${color}`;

    const titleEl = document.getElementById("val-txn-title");
    titleEl.textContent = verdict;
    titleEl.style.color = color;
    document.getElementById("val-txn-channel").textContent = `Channel: ${channel.toUpperCase()}`;

    // Populate Risk Factors Table
    const tbody = document.getElementById("tbody-risk-factors");
    tbody.innerHTML = "";
    if (data.risk_factors && data.risk_factors.length > 0) {
        data.risk_factors.forEach(f => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${f.factor}</strong></td>
                <td><span class="sev-badge sev-${f.severity}">${f.severity}</span></td>
                <td>${f.description}</td>
                <td><strong style="color: ${color}">+${f.points_added}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" style="text-align:center; color: var(--safe);">All payment parameters within trusted bounds.</td>`;
        tbody.appendChild(tr);
    }
}

// -------------------------------------------------------------------------
// Community Scam Database & Reporting
// -------------------------------------------------------------------------
function initCommunityFeed() {
    const form = document.getElementById("form-report-scam");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const type = document.getElementById("report-type").value;
        const content = document.getElementById("report-content").value.trim();
        const sender = document.getElementById("report-sender").value.trim();
        const riskScore = document.getElementById("report-risk-score").value;
        const reason = document.getElementById("report-reason").value.trim();
        const email = document.getElementById("report-email").value.trim();

        if (!content || !reason) {
            showToast("Content and reason are required.", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/report-scam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    report_type: type,
                    content,
                    sender: sender || null,
                    risk_score_at_report: riskScore ? parseInt(riskScore) : null,
                    reported_reason: reason,
                    reporter_email: email || null
                })
            });

            if (!res.ok) throw new Error("Report submission failed");
            const result = await res.json();
            showToast(`Report #${result.report_id} logged to community DB!`, "success");
            form.reset();
            loadCommunityReports();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    document.getElementById("btn-refresh-feed").addEventListener("click", loadCommunityReports);

    // Filters
    const filters = document.querySelectorAll(".filter-chip");
    filters.forEach(f => {
        f.addEventListener("click", () => {
            filters.forEach(c => c.classList.remove("active"));
            f.classList.add("active");
            loadCommunityReports(f.dataset.filter === "all" ? null : f.dataset.filter);
        });
    });
}

async function loadCommunityReports(typeFilter = null) {
    const listEl = document.getElementById("community-reports-list");
    listEl.innerHTML = `<div class="loading-spinner">Fetching community records...</div>`;

    try {
        let url = `${API_BASE}/reports?limit=30`;
        if (typeFilter) url += `&report_type=${typeFilter}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch reports");
        const reports = await res.json();

        if (reports.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-dim);">No community scam reports found. Be the first to report!</div>`;
            return;
        }

        listEl.innerHTML = "";
        reports.forEach(r => {
            const card = document.createElement("div");
            card.className = "report-item-card";
            const dateStr = new Date(r.created_at).toLocaleString();
            card.innerHTML = `
                <div class="report-item-header">
                    <span class="report-type-badge">${r.report_type}</span>
                    <span class="report-date">${dateStr}</span>
                </div>
                <div class="report-snippet">${escapeHtml(r.content)}</div>
                <div class="report-reason"><strong>Reason:</strong> ${escapeHtml(r.reason)}</div>
            `;
            listEl.appendChild(card);
        });
    } catch (e) {
        listEl.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Failed to load live threat feed: ${e.message}</div>`;
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// -------------------------------------------------------------------------
// Fusion Weights Tuner
// -------------------------------------------------------------------------
function initFusionTuner() {
    const sText = document.getElementById("slider-w-text");
    const sUrl = document.getElementById("slider-w-url");
    const sTxn = document.getElementById("slider-w-txn");

    const dText = document.getElementById("disp-w-text");
    const dUrl = document.getElementById("disp-w-url");
    const dTxn = document.getElementById("disp-w-txn");
    const dFormula = document.getElementById("disp-sim-formula");

    function updateTuner() {
        const wt = parseFloat(sText.value);
        const wu = parseFloat(sUrl.value);
        const wx = parseFloat(sTxn.value);

        dText.textContent = wt.toFixed(2);
        dUrl.textContent = wu.toFixed(2);
        dTxn.textContent = wx.toFixed(2);

        // Normalize
        const total = wt + wu + wx || 1.0;
        const nText = wt / total;
        const nUrl = wu / total;
        const nTxn = wx / total;

        // Sample text=86, url=94, txn=90
        const simScore = (86 * nText) + (94 * nUrl) + (90 * nTxn);
        let verdict = "Safe";
        let colorClass = "text-safe";
        if (simScore >= 75) {
            verdict = "Dangerous";
            colorClass = "text-danger";
        } else if (simScore >= 40) {
            verdict = "Suspicious";
            colorClass = "text-warning";
        }

        dFormula.innerHTML = `
            (${nText.toFixed(2)} * 86) + (${nUrl.toFixed(2)} * 94)${nTxn > 0 ? ` + (${nTxn.toFixed(2)} * 90)` : ''} 
            = <strong>${simScore.toFixed(1)}</strong> &rarr; <span class="${colorClass} font-bold">${verdict}</span>
        `;
    }

    sText.addEventListener("input", updateTuner);
    sUrl.addEventListener("input", updateTuner);
    sTxn.addEventListener("input", updateTuner);
    updateTuner();
}
