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
    document.querySelector(`#${section}-comments`)
      .previousElementSibling.querySelector("textarea");

  const text = textarea.value.trim();
  if (!text) return;

  await supabase
    .from(section)
    .insert({ text, reply: "" });

  textarea.value = "";
  loadComments(section);
}

/* ---------- DELETE COMMENT ---------- */
async function deleteComment(section, id) {
  if (!confirm("Delete this comment?")) return;

  await supabase
    .from(section)
    .delete()
    .eq("id", id);

  loadComments(section);
}

/* ---------- SAVE ADMIN REPLY ---------- */
async function saveReply(section, id) {
  const input = document.getElementById(`reply-${id}`);
  const reply = input.value.trim();
  if (!reply) return;

  await supabase
    .from(section)
    .update({ reply })
    .eq("id", id);

  loadComments(section);
}

/* ---------- LOAD COMMENTS ---------- */
async function loadComments(section) {
  const container = document.getElementById(`${section}-comments`);
  container.innerHTML = "";

  const { data, error } = await supabase
    .from(section)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(item => {
    container.innerHTML += `
      <div class="comment">
        <div class="author">
          Student
          <button class="delete-btn"
            onclick="deleteComment('${section}', '${item.id}')">
            Delete
          </button>
        </div>

        <div>${item.text}</div>
        <small>${new Date(item.created_at).toLocaleString()}</small>

        ${
          item.reply
            ? `<div class="reply">
                 <strong>Admin</strong>
                 <div>${item.reply}</div>
               </div>`
            : isAdmin
            ? `<div class="reply">
                 <textarea id="reply-${item.id}"
                   placeholder="Admin reply..."></textarea>
                 <button onclick="saveReply('${section}', '${item.id}')">
                   Reply
                 </button>
               </div>`
            : ""
        }
      </div>
    `;
  });
}

/* ---------- INITIAL LOAD ---------- */
loadComments("doubts");
loadComments("projects");
