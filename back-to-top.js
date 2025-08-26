const btn = document.getElementById( "backToTop" ) ;
btn.title = "Go back to the top of this page" ;

window.addEventListener("scroll", () => {
  // The back-to-top button shows up if the current window is away from the top.
  // Otherwise, it fades out.
  ( window.scrollY > 300 ) ? btn.classList.add("show") : btn.classList.remove("show") ;
});

btn.addEventListener("click", () => {
  // Goes back to the top in a elegant fashion.
  window.scrollTo( { top: -Infinity, behavior: "smooth" } ) ;
  // window.scroll() ;
});