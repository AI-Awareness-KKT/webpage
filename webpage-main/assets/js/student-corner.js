/* ---------- GLOBAL STATE ---------- */
let isAdmin = false;

/* ---------- ADMIN LOGIN ---------- */
function enableAdminMode() {
  const password = prompt("Enter admin password");
  if (password === "admin123") {
    isAdmin = true;
    alert("Admin mode enabled");
    loadComments("doubts");
    loadComments("projects");
  } else {
    alert("Invalid password");
  }
}

/* ---------- POST COMMENT ---------- */
async function postComment(section) {
  const textarea =
    document.querySelector(`#${section}-comments`)?.previousElementSibling
      ?.querySelector("textarea") ||
    document.querySelector("textarea");

  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) return;

  // 🔐 REQUIRE NAME FROM HOME PAGE
  const authorName = localStorage.getItem("student_name");
  if (!authorName) {
    alert("Please enter your name on the home page first.");
    return;
  }

  // ⏳ Prevent multiple clicks
  textarea.disabled = true;

  const { error } = await window.supabase
    .from(section)
    .insert({
      text: text,
      author_name: authorName
    });

  textarea.disabled = false;

  if (error) {
    console.error("Insert error:", error);
    alert("Failed to submit. Please try again.");
    return;
  }

  textarea.value = "";

  // 🔴 KEY LOGIC
  if (section === "projects") {
    alert(
      "Your idea has been submitted successfully.\nWe will reply to you shortly."
    );
    return; // DO NOT LOAD COMMENTS
  }

  loadComments(section);
}



/* ---------- DELETE COMMENT ---------- */
async function deleteComment(section, id) {
  if (!confirm("Delete this comment?")) return;

  const { error } = await window.supabase
    .from(section)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
  }

  loadComments(section);
}

/* ---------- SAVE ADMIN REPLY ---------- */
async function saveReply(section, id) {
  const input = document.getElementById(`reply-${id}`);
  const reply = input.value.trim();
  if (!reply) return;

  const { error } = await window.supabase
    .from(section)
    .update({ reply })
    .eq("id", id);

  if (error) {
    console.error("Reply error:", error);
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
        <div class="author">
  ${item.author_name || "Student"}
  ${
    isAdmin
      ? `<button class="delete-btn"
           onclick="deleteComment('${section}', '${item.id}')">
           Delete
         </button>`
      : ""
  }
</div>




        <div>${item.text}</div>
        <small>${new Date(item.created_at).toLocaleString()}</small>

        ${
          item.reply
            ? `<div class="reply"><strong>Admin</strong><div>${item.reply}</div></div>`
            : isAdmin
            ? `<div class="reply">
                 <textarea id="reply-${item.id}" placeholder="Admin reply..."></textarea>
                 <button onclick="saveReply('${section}', '${item.id}')">Reply</button>
               </div>`
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
