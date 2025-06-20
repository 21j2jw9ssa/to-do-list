"use strict"

//////////////////////////////////////////
//////// ITEM DRAGGING OPERATIONS ////////
//////////////////////////////////////////

document.addEventListener( "DOMContentLoaded", function() {
  const buffer = document.getElementById( "buffer" ) ;

  //// Dragging function 1: obtain item location
  function GetDragAfterElem( container, y ) {
    return [ ...container.querySelectorAll( "li:not(.dragging)" ) ].reduce( function( closest, child ) {
      const box = child.getBoundingClientRect(), offset = y - box.top - box.height / 2 ;
      return ( offset < 0 && offset > closest.offset ) ? { offset: offset, element: child } : closest ;
    }, { offset: Number.NEGATIVE_INFINITY } ).element ;
  } // GetDragAfterElem()

  //// Dragging function 2: check if the html element has a specific child
  function CheckParent( parent, child ) {
    return parent.contains(child) ;
  } // CheckParent()

  //// Dragging trigger 1: when beginning to drag ONE item
  buffer.addEventListener( "dragstart", function(e) {
    e.target.classList.add( "dragging" ), e.dataTransfer.effectAllowed = "move" ;
    gLM.SetDragStartIdx( [ ...buffer.children ].indexOf( e.target ) ) ;
  }) ;

  //// Dragging trigger 2: while dragging ONE specific item
  buffer.addEventListener( "dragover", function(e) {
    e.preventDefault() ;
    const dragging = document.querySelector( ".dragging" ), afterElem = GetDragAfterElem( buffer, e.clientY ) ;
    try {
      ( afterElem == null ) ? buffer.appendChild( dragging ) : buffer.insertBefore( dragging, afterElem ) ;
    } catch {
      console.log( "Error: captured non-list draggable items." ) ;
    }
  }) ;

  //// Dragging trigger 3: when finishing dragging ONE specific item
  buffer.addEventListener( "dragend", function(e) {
    e.target.classList.remove( "dragging" ) ;
    gLM.SetDragEndIdx( [ ...buffer.children ].indexOf( e.target ) ) ;
    gLM.MoveItemInsideTheList() ;
  }) ;
}) ;