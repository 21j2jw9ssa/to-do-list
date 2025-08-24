"use strict"

// OLD ONE

//////////////////////////////////////////
//////// ITEM DRAGGING OPERATIONS ////////
//////////////////////////////////////////

// document.addEventListener( "DOMContentLoaded", function() {
// const buffer = document.getElementById( "buffer" ) ;

//   //// Dragging function 1: obtain item location
//   function GetDragAfterElem( container, y ) {
//     return [ ...container.querySelectorAll( "li:not(.dragging)" ) ].reduce( function( closest, child ) {
//       const box = child.getBoundingClientRect(), offset = y - box.top - box.height / 2 ;
//       return ( offset < 0 && offset > closest.offset ) ? { offset: offset, element: child } : closest ;
//     }, { offset: Number.NEGATIVE_INFINITY } ).element ;
//   } // GetDragAfterElem()

//   //// Dragging trigger 1: when beginning to drag ONE item
//   buffer.addEventListener( "dragstart", function(e) {
//     e.target.classList.add( "dragging" ), e.dataTransfer.effectAllowed = "move" ;
//     gLM.SetDragStartIdx( [ ...buffer.children ].indexOf( e.target ) ) ;
//   }) ;

//   //// Dragging trigger 2: while dragging ONE specific item
//   buffer.addEventListener( "dragover", function(e) {
//     e.preventDefault() ;
//     const dragging = document.querySelector( ".dragging" ), afterElem = GetDragAfterElem( buffer, e.clientY ) ;
//     try {
//       ( afterElem == null ) ? buffer.appendChild( dragging ) : buffer.insertBefore( dragging, afterElem ) ;
//     } catch {
//       console.log( "Error: captured non-list draggable items." ) ;
//     }
//   }) ;

//   //// Dragging trigger 3: when finishing dragging ONE specific item
//   buffer.addEventListener( "dragend", async function(e) {
//     e.target.classList.remove( "dragging" ) ;
//     gLM.SetDragEndIdx( [ ...buffer.children ].indexOf( e.target ) ) ;
//     await gLM.MoveItemInsideTheList() ;

//     requestAnimationFrame( () => gLM.UpdateAllItemsIndices() );
//     gLM.SaveList() ;
//   }) ;
// }) ;

// NEW ONE

//////////////////////////////////////////
//////// ITEM DRAGGING OPERATIONS ////////
//////////////////////////////////////////

const el = document.getElementById('buffer') ;

Sortable.create( el, {
  group: { name: 'cards', pull: false, put: false },   // no leaving
  animation: 150,                                      // smooth movement
  handle: '[data-type-name="drag"]',                   // only drag by this handle
  direction: 'vertical',                               // only up/down
  ghostClass: 'dragging',                              // CSS class while dragging
  onStart: e => {     // when starting dragging
    gLM.SetDragStartIdx(e.oldIndex) ;
  },
  onEnd: async e => { // when finishing dragging
    gLM.SetDragEndIdx(e.newIndex) ;
    await gLM.MoveItemInsideTheList() ;
    gLM.SaveList() ;
  }
});