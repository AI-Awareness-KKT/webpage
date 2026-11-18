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
  if (!SHEET_URL || SHEET_URL.startsWith("PASTE")) return Promise.resolve();
  return fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams(data)
  }).catch(err => console.error("Sheet error:", err));
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
    const textEl = document.getElementById("projects-text");
    fields = [textEl];
    text = textEl.value.trim();
    if (!text) return;

    // REQUIRE NAME FROM HOME PAGE (unchanged for AI ideas)
    authorName = localStorage.getItem("student_name");
    if (!authorName) {
      alert("Please enter your name on the home page first.");
      return;
    }
  }

  // Prevent multiple clicks
  fields.forEach(f => (f.disabled = true));

  const [{ error }] = await Promise.all([
    window.supabase.from(section).insert({
      text: text,
      author_name: authorName
    }),
    sendToSheet(
      section === "doubts"
        ? { type: "doubt", name: authorName, school: school, doubt: text }
        : { type: "idea", name: authorName, idea: text }
    )
  ]);

  fields.forEach(f => (f.disabled = false));

  if (error) {
    console.error("Insert error:", error);
    alert("Failed to submit. Please try again.");
    return;
  }

  fields.forEach(f => (f.value = ""));

  if (section === "projects") {
    alert(
      "Your idea has been submitted successfully.\nWe will reply to you shortly."
    );
    return; // DO NOT LOAD COMMENTS
  }

  loadComments(section);
}

/* ---------- LOAD COMMENTS ---------- */
async function loadComments(section) {
  const container = document.getElementById(`${section}-comments`);
  container.innerHTML = "";

  const { data, error } = await window.supabase
    .from(section)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
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
