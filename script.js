// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  // ---------- elements ----------
  const loginPage = document.getElementById("loginPage");
  const loginForm = document.getElementById("loginForm");
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const togglePwd = document.getElementById("togglePwd");
  const loginError = document.getElementById("loginError");

  const app = document.getElementById("app");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  const navWelcome = document.getElementById("navWelcome");
  const navApply = document.getElementById("navApply");
  const navRecords = document.getElementById("navRecords");
  const btnLogout = document.getElementById("btnLogout");

  const welcomeSection = document.getElementById("welcomeSection");
  const applySection = document.getElementById("applySection");
  const recordsSection = document.getElementById("recordsSection");

  // apply form elements
  const leaveForm = document.getElementById("leaveForm");
  const leaveMode = document.getElementById("leaveMode");
  const continuousFields = document.getElementById("continuousFields");
  const specificFields = document.getElementById("specificFields");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const specificDate = document.getElementById("specificDate");
  const addDateBtn = document.getElementById("addDateBtn");
  const dateList = document.getElementById("dateList");
  const numDaysEl = document.getElementById("numDays");
  const previewBtn = document.getElementById("previewBtn");
  const previewBox = document.getElementById("previewBox");
  const recentBody = document.getElementById("recentBody");
  const recordsBody = document.getElementById("recordsBody");

  // demo users (for testing)
  const users = {
    ram: { password: "ram123", role: "Storage Engineer", display: "Ram" },
    sai: { password: "sai123", role: "Network Engineer", display: "Sai" },
    krishna: { password: "krishna123", role: "Backup Engineer", display: "Krishna" }
  };
  let currentUser = null;

  // store submissions
  const records = [];

  // ---------- login ----------
  togglePwd.addEventListener("click", () => {
    passwordEl.type = passwordEl.type === "password" ? "text" : "password";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const uname = (usernameEl.value || "").trim().toLowerCase();
    const pwd = (passwordEl.value || "").trim();
    loginError.style.display = "none";
    if (!uname || !pwd) {
      loginError.textContent = "Please enter username and password";
      loginError.style.display = "block";
      return;
    }
    const u = users[uname];
    if (!u || u.password !== pwd) {
      loginError.textContent = "Invalid username or password";
      loginError.style.display = "block";
      return;
    }
    // success
    currentUser = { key: uname, name: u.display, role: u.role };
    // show app
    loginPage.style.display = "none";
    app.classList.remove("hidden");
    hamburgerBtn.style.display = "block";
    // default view
    showSection("welcome");
    renderRecordsTable();
  });

  // ---------- sidebar toggle ----------
  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("shift");
  });

  // ---------- nav ----------
  navWelcome.addEventListener("click", (e) => { e.preventDefault(); showSection("welcome"); });
  navApply.addEventListener("click", (e) => { e.preventDefault(); showSection("apply"); });
  navRecords.addEventListener("click", (e) => { e.preventDefault(); showSection("records"); });

  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();
    currentUser = null;
    // reset UI
    loginPage.style.display = "";
    app.classList.add("hidden");
    hamburgerBtn.style.display = "none";
    sidebar.classList.remove("active");
    mainContent.classList.remove("shift");
    // clear login inputs
    usernameEl.value = "";
    passwordEl.value = "";
    previewBox.classList.add("hidden");
  });

  function showSection(name) {
    welcomeSection.classList.remove("active");
    applySection.classList.remove("active");
    recordsSection.classList.remove("active");
    welcomeSection.style.display = "none";
    applySection.style.display = "none";
    recordsSection.style.display = "none";

    if (name === "welcome") {
      welcomeSection.style.display = "block";
    } else if (name === "apply") {
      applySection.style.display = "block";
    } else if (name === "records") {
      recordsSection.style.display = "block";
      renderRecordsTable();
    }
    // close sidebar on nav (optional)
    sidebar.classList.remove("active");
    mainContent.classList.remove("shift");
  }

  // ---------- leave-mode handling ----------
  leaveMode.addEventListener("change", () => {
    const mode = leaveMode.value;
    if (mode === "continuous") {
      continuousFields.style.display = "grid";
      specificFields.classList.add("hidden");
    } else {
      continuousFields.style.display = "none";
      specificFields.classList.remove("hidden");
    }
    dateList.innerHTML = "";
    specificDates = [];
    numDaysEl.textContent = "0";
  });

  // ---------- calculate days ----------
  // continuous
  function updateDaysFromRange() {
    const f = fromDate.value;
    const t = toDate.value;
    if (!f || !t) {
      numDaysEl.textContent = "0";
      return;
    }
    const from = new Date(f);
    const to = new Date(t);
    if (isNaN(from) || isNaN(to) || to < from) {
      numDaysEl.textContent = "0";
      return;
    }
    const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
    numDaysEl.textContent = String(diff);
  }
  fromDate.addEventListener("change", updateDaysFromRange);
  toDate.addEventListener("change", updateDaysFromRange);

  // specific dates set
  let specificDates = [];
  addDateBtn.addEventListener("click", () => {
    const d = specificDate.value;
    if (!d) return;
    if (!specificDates.includes(d)) {
      specificDates.push(d);
      renderSpecificDates();
      updateDaysForSpecific();
    }
    specificDate.value = "";
  });

  function renderSpecificDates() {
    dateList.innerHTML = "";
    specificDates.sort((a,b)=>new Date(a)-new Date(b)).forEach(d => {
      const li = document.createElement("li");
      li.className = "chips-item";
      li.innerHTML = `${d} <button class="remove-chip" data-date="${d}">✕</button>`;
      dateList.appendChild(li);
    });
    // remove handler
    dateList.querySelectorAll(".remove-chip").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const dt = ev.currentTarget.dataset.date;
        specificDates = specificDates.filter(x => x !== dt);
        renderSpecificDates();
        updateDaysForSpecific();
      });
    });
  }

  function updateDaysForSpecific() {
    numDaysEl.textContent = String(specificDates.length || 0);
  }

  // preview behavior
  previewBtn.addEventListener("click", () => {
    if (!currentUser) { alert("Please login first"); return; }
    const leaveType = document.getElementById("leaveType").value;
    const mode = leaveMode.value;
    const days = numDaysEl.textContent;
    let datesText = "";
    if (mode === "continuous") datesText = `${fromDate.value || ""} to ${toDate.value || ""}`;
    else datesText = specificDates.join(", ");

    // build preview HTML
    const html = `
      <p><strong>To:</strong> Manager</p>
      <p><strong>Subject:</strong> Leave Request</p>
      <p>Hi Manager,</p>
      <p>I would like to request leave as per the details below:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="border:1px solid #eee;padding:8px"><b>Leave Type</b></td><td style="border:1px solid #eee;padding:8px">${escapeHtml(leaveType)}</td></tr>
        <tr><td style="border:1px solid #eee;padding:8px"><b>Leave Mode</b></td><td style="border:1px solid #eee;padding:8px">${escapeHtml(mode)}</td></tr>
        <tr><td style="border:1px solid #eee;padding:8px"><b>Dates</b></td><td style="border:1px solid #eee;padding:8px">${escapeHtml(datesText)}</td></tr>
        <tr><td style="border:1px solid #eee;padding:8px"><b>No. of Days</b></td><td style="border:1px solid #eee;padding:8px">${escapeHtml(days)}</td></tr>
      </table>
      <p>Kindly approve my request.</p>
      <p>Thanks & Regards,<br><strong>${escapeHtml(currentUser.name)}</strong><br>${escapeHtml(currentUser.role)}</p>
    `;
    previewBox.innerHTML = html;
    previewBox.classList.remove("hidden");
  });

  // submit leave
  leaveForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) { alert("Please login"); return; }
    const type = document.getElementById("leaveType").value;
    const mode = leaveMode.value;
    const days = parseInt(numDaysEl.textContent || "0", 10);
    let datesText = mode === "continuous" ? `${fromDate.value || ""} to ${toDate.value || ""}` : (specificDates.join(", "));

    if (!type) { alert("Select leave type"); return; }
    if (!mode) { alert("Select leave mode"); return; }
    if (days <= 0) { alert("Please choose valid dates"); return; }

    const rec = {
      employee: currentUser.name,
      role: currentUser.role,
      type, mode, dates: datesText, days,
      reason: (document.getElementById("reason")||{value:""}).value,
      appliedOn: new Date().toISOString().slice(0,10)
    };
    records.push(rec);
    addToRecent(rec);
    renderRecordsTable();
    // clear form
    leaveForm.reset();
    specificDates = [];
    dateList.innerHTML = "";
    numDaysEl.textContent = "0";
    previewBox.classList.add("hidden");
    alert("Leave submitted ✓");
  });

  // helper: add to recent panel
  function addToRecent(rec){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(rec.employee)}</td><td>${escapeHtml(rec.type)}</td><td>${escapeHtml(rec.mode)}</td><td>${rec.days}</td>`;
    recentBody.insertAdjacentElement("afterbegin", tr);
  }

  function renderRecordsTable(){
    recordsBody.innerHTML = "";
    if (records.length === 0){
      recordsBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#6b7280;padding:12px">No records yet</td></tr>`;
      return;
    }
    records.slice().reverse().forEach(r=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${escapeHtml(r.employee)}</td><td>${escapeHtml(r.role)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.mode)}</td><td>${escapeHtml(r.dates)}</td><td>${r.days}</td><td>${escapeHtml(r.reason||"")}</td>`;
      recordsBody.appendChild(tr);
    });
  }

  // initial sample records (optional)
  const sample = [
    {employee:"Ram",role:"Storage Engineer",type:"Casual",mode:"Specific",dates:"2025-08-29",days:1,reason:"Personal"},
    {employee:"Sai",role:"Network Engineer",type:"Sick",mode:"Continuous",dates:"2025-08-28 to 2025-08-30",days:3,reason:"Fever"}
  ];
  sample.forEach(s=>records.push(s));
  // render initial welcome
  renderRecordsTable();

  // small helper
  function escapeHtml(str){ return String(str||"").replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }

  // expose showSection used earlier
  window.showSection = (name) => {
    // name: "welcome","apply","records"
    showSection(name);
  };

  // initial view hidden until login
  showSection("welcome");
});
