const params = new URLSearchParams(window.location.search);
const schoolId = params.get("id");

const school = schools.find(s => s.id === schoolId);

if(!school){
  document.body.innerHTML = "<h2>School not found</h2>";
  throw new Error("Invalid school ID");
}

document.getElementById("schoolTitle").textContent =
  `SCHOOL – ${school.name}`;

document.getElementById("schoolDate").textContent =
  `Date: ${school.date}`;

const gallery = document.getElementById("schoolGallery");

for(let i = 1; i <= school.images; i++){
  const div = document.createElement("div");
  div.className = "gallery-item";
  div.innerHTML = `<img src="${school.folder}/${i}.jpg">`;
  gallery.appendChild(div);
}
