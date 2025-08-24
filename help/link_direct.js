////////////////////////////////////////////////////////
////                                                ////
////    THE FOLLOWING CODES ARE MADE ON MY OWN.     ////
////    NEVER COPY WITHOUT PERMISSION.              ////
////    ALL RIGHTS RESERVED.                        ////
////                                                ////
////    以下程式皆是鄙人親自撰寫。未經同意不可複製！    ////
////    版權所有。                                   ////
////                                                ////
////////////////////////////////////////////////////////

"use strict"

document.addEventListener( "DOMContentLoaded", function() {

  const sortItemsDropdown = document.getElementById( "dropdown" ) ;

  // Direct users to the (sub) topics by the tab selected
  sortItemsDropdown.addEventListener( "change", function() {
    const targetId = this.value ;
    if ( targetId ) {
      const target = document.getElementById( targetId ) ;
      if ( target ) target.scrollIntoView() ;
      if ( targetId !== "" ) {
        sortItemsDropdown.getElementsByTagName("option")[0].disabled = true ;
      }
    }
  });

  menu.querySelectorAll("li").forEach(item => {
    item.addEventListener( "click", () => {
      console.log(item) ;
      const targetId = `sort-items-${item.dataset.mode}` ;
      if ( targetId ) {
        const target = document.getElementById( targetId ) ;
        if ( target ) target.scrollIntoView() ;
      }
    });
  });
}) ;