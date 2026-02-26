const randomGallery = document.getElementById("randomGallery");
const schoolTable = document.getElementById("schoolTable");

/* ---- RANDOM IMAGES (LEFT) ---- */
let allImages = [];

schools.forEach(school => {
  for(let i = 1; i <= school.images; i++){
    allImages.push({
      src: `${school.folder}/${i}.jpg`,
      school: school.id
    });
  }
});

// Shuffle
allImages.sort(() => Math.random() - 0.5);

// Render limited random images
allImages.slice(0, 20).forEach(img => {
  const div = document.createElement("div");
  div.className = "gallery-item";
  div.innerHTML = `<img src="${img.src}" />`;
  randomGallery.appendChild(div);
});

/* ---- SCHOOL TABLE (RIGHT) ---- */
schools.forEach(school => {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${school.name}</td>`;
  row.onclick = () => {
    window.location.href = `school.html?id=${school.id}`;
  };
  schoolTable.appendChild(row);
});
