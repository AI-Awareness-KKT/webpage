/* ---------- SAFE TEXT (blocks code injection) ---------- */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- GOOGLE SHEET LINK ---------- */
// Paste your Apps Script Web App URL here (ends with /exec)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwh2g91ifcWddBgEQr_xeqahDBmS2-VHpWDKxJClA_qK9GmAf7Exd-FVl5Sn5CDjfWawg/exec";

function sendToSheet(data) {
  if (!SHEET_URL || SHEET_URL.startsWith("PASTE")) {
    return Promise.reject(new Error("SHEET_URL not set"));
  }
  return fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams(data)
  });
}

/* ---------- POST COMMENT ---------- */
async function postComment(section) {
  let text, authorName, school = "";
  let fields = [];

  if (section === "doubts") {
    const nameEl = document.getElementById("doubt-name");
    const schoolEl = document.getElementById("doubt-school");
    const textEl = document.getElementById("doubt-text");
    fields = [nameEl, schoolEl, textEl];

    authorName = nameEl.value.trim();
    school = schoolEl.value.trim();
    text = textEl.value.trim();

    if (!authorName || !school || !text) {
      alert("Please fill in your Name, School and Doubt.");
      return;
    }
  } else {
    const nameEl = document.getElementById("idea-name");
    const textEl = document.getElementById("projects-text");
    fields = [nameEl, textEl];

    authorName = nameEl.value.trim();
    text = textEl.value.trim();

    if (!authorName || !text) {
      alert("Please fill in your Name and your AI idea.");
      return;
    }
  }

  // Prevent multiple clicks
  fields.forEach(f => (f.disabled = true));

  // 1) Google Sheet = main record
  let sheetOk = true;
  try {
    await sendToSheet(
      section === "doubts"
        ? { type: "doubt", name: authorName, school: school, doubt: text }
        : { type: "idea", name: authorName, idea: text }
    );
  } catch (e) {
    sheetOk = false;
  }

  // 2) Supabase = only for showing doubts on the page (optional, never blocks)
  try {
    const { error } = await window.supabase
      .from(section)
      .insert({ text: text, author_name: authorName });
    if (error) console.warn("Supabase insert skipped:", error.message);
  } catch (e) {
    console.warn("Supabase not reachable:", e);
  }

  fields.forEach(f => (f.disabled = false));

  if (!sheetOk) {
    alert("Failed to submit. Please check your internet and try again.");
    return;
  }

  fields.forEach(f => (f.value = ""));

  if (section === "projects") {
    alert("Your idea has been submitted successfully.\nWe will reply to you shortly.");
    return;
  }

  alert("Your doubt has been submitted successfully.");
  loadComments(section);
}

/* ---------- LOAD COMMENTS ---------- */
async function loadComments(section) {
  const container = document.getElementById(`${section}-comments`);
  container.innerHTML = "";

  let data, error;
  try {
    ({ data, error } = await window.supabase
      .from(section)
      .select("*")
      .order("created_at", { ascending: false }));
  } catch (e) {
    error = e;
  }

  if (error || !data) {
    console.error("Fetch error:", error);
    return;
  }

  data.forEach(item => {
    container.innerHTML += `
      <div class="comment">
        <div class="author">${escapeHtml(item.author_name || "Student")}</div>
        <div>${escapeHtml(item.text)}</div>
        <small>${new Date(item.created_at).toLocaleString()}</small>
        ${
          item.reply
            ? `<div class="reply"><strong>Admin</strong><div>${escapeHtml(item.reply)}</div></div>`
            : ""
        }
      </div>
    `;
  });
}

/* ---------- INITIAL LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadComments("doubts");
});
