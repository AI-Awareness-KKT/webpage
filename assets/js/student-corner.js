/* =====================================
   STUDENT CORNER – COMMENTS + ADMIN REPLY
===================================== */

let isAdmin = false;

/* ---------- ADMIN LOGIN ---------- */
function enableAdminMode(){
  const password = prompt("Enter admin password");

  if(password === "admin123"){
    isAdmin = true;
    alert("Admin mode enabled");
    renderComments("doubts");
    renderComments("projects");
  } else {
    alert("Invalid password");
  }
}

/* ---------- POST COMMENT ---------- */
function postComment(section){
  const textarea =
    document.querySelector(`#${section}-comments`)
      .previousElementSibling.querySelector("textarea");

  const text = textarea.value.trim();
  if (!text) return;

  const comments = JSON.parse(localStorage.getItem(section) || "[]");

  comments.unshift({
    text,
    reply: "",
    time: new Date().toLocaleString()
  });

  localStorage.setItem(section, JSON.stringify(comments));
  textarea.value = "";
  renderComments(section);
}

/* ---------- DELETE COMMENT ---------- */
function deleteComment(section, index){
  if(!confirm("Delete this comment?")) return;

  const comments = JSON.parse(localStorage.getItem(section));
  comments.splice(index, 1);

  localStorage.setItem(section, JSON.stringify(comments));
  renderComments(section);
}

/* ---------- SAVE ADMIN REPLY ---------- */
function saveReply(section, index){
  const input = document.getElementById(`reply-${section}-${index}`);
  const text = input.value.trim();
  if(!text) return;

  const comments = JSON.parse(localStorage.getItem(section));
  comments[index].reply = text;

  localStorage.setItem(section, JSON.stringify(comments));
  renderComments(section);
}

/* ---------- RENDER COMMENTS ---------- */
function renderComments(section){
  const container = document.getElementById(`${section}-comments`);
  const comments = JSON.parse(localStorage.getItem(section) || "[]");

  container.innerHTML = "";

  comments.forEach((item, index) => {
    container.innerHTML += `
      <div class="comment">
        <div class="author">
          Student
          <button class="delete-btn"
            onclick="deleteComment('${section}', ${index})">
            Delete
          </button>
        </div>

        <div>${item.text}</div>
        <small>${item.time}</small>

        ${
          item.reply
          ? `<div class="reply">
               <strong>Admin</strong>
               <div>${item.reply}</div>
             </div>`
          : isAdmin
          ? `<div class="reply">
               <textarea id="reply-${section}-${index}"
                 placeholder="Admin reply..."></textarea>
               <button onclick="saveReply('${section}', ${index})">
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
renderComments("doubts");
renderComments("projects");
