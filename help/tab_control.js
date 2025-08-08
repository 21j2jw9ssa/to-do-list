document.addEventListener( "DOMContentLoaded", function() {
// Selects all tab content containers
const tabContainers = document.querySelectorAll( ".tab-container" ) ;

tabContainers.forEach( container => {

  // tabs in a tab content container
  const tabs = container.querySelectorAll( ".tab" ) ;

  // tab sections in a tab content container
  const tabSections = container.querySelectorAll( ".tab-content" ) ;

  tabs.forEach( tab => {
    tab.addEventListener( "click", () => {
      // Remove active from all tabs/contents in this container
      tabs.forEach( t => t.classList.remove( "active" ) ) ;
      tabSections.forEach( c => c.classList.remove( "active" ) ) ;

      tab.classList.add( "active" ) ;

      const targetCtnt = container.querySelector( `#${tab.dataset.target}` ) ;
      if ( targetCtnt ) targetCtnt.classList.add( "active" ) ;
    }) ;
  }) ;
}) ;
}) ;