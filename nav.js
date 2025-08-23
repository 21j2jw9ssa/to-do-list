document.addEventListener( "DOMContentLoaded", function() {

  // Get all tabs of the navigator bar
  const navBar = document.getElementById("nav-of-links") ;
  const navBarCells = navBar.getElementsByTagName( "a" ) ;

  // Then detect the tab with an empty hyperlink reference:
  // it is the current page.
  for ( let i = 0 ; i < navBarCells.length ; i++ ) {
    if ( navBarCells[i].getAttribute("href").length === 0 ) {
      navBarCells[i].classList.add("current-page") ;
    } 
  }

  window.addEventListener( "scroll", () => {
    if ( window.scrollY > 0 )
      navBar.classList.add("is-stuck") ;
    else
      navBar.classList.remove("is-stuck") ;
  }) ;
}) ;