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

  // Direct users to the (sub) topics by the tab selected
  document.getElementById( "dropdown_list" ).addEventListener( "change", function() {
    const targetId = this.value ;
    if ( targetId ) {
      const target = document.getElementById( targetId ) ;
      if ( target ) target.scrollIntoView() ;
    }
  });

}) ;
