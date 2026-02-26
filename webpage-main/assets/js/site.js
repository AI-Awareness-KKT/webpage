
// Initialize AOS if available, and add small stagger animation for gallery images
document.addEventListener('DOMContentLoaded', function(){
  if(window.AOS && AOS.init){
    AOS.init({duration:700, easing:'ease-out-quart', once:true, mirror:false});
  }
  // Add subtle reveal for gallery items in sequence
  const galleryImgs = document.querySelectorAll('.gallery-grid img');
  galleryImgs.forEach((img, i)=>{
    img.style.opacity = '0';
    img.style.transform = 'translateY(12px)';
    setTimeout(()=>{
      img.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.9,.3,1)';
      img.style.opacity = '1';
      img.style.transform = 'translateY(0)';
    }, 120 + i*80);
    // Hover lift handled by CSS
  });
});
