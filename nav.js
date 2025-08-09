document.addEventListener( "DOMContentLoaded", function() {

  // Get all tabs of the navigator bar
  const navBar = document.querySelectorAll( "#nav-of-links a" ) ;

  // Then detect the tab with an empty hyperlink reference:
  // it is the current page.
  for ( let i = 0 ; i < navBar.length ; i++ ) {
    if ( navBar[i].getAttribute("href").length === 0 ) {
      navBar[i].classList.add("current-page") ;
    } 
  }

}) ;

