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

///////////////////////////
//////// HTML TAGS ////////
///////////////////////////

function UpdateDropdownState() {
  console.log( `Number of items: ${gLM.GetListSize()}` ) ;
  gLM.GetListSize() === 0 ? disableDropdown() : enableDropdown() ;
} // UpdateDropdownState()

document.addEventListener( "DOMContentLoaded", async function() {

await gLM.LoadListLastState() ;
UpdateDropdownState() ;

/////////////////////////////////////////////
//////// ITEM TRIGGERING INTEGRATION ////////
/////////////////////////////////////////////

const listBuffer = document.getElementById( "buffer" ) ;

listBuffer.addEventListener( "click", function( event ) {
  if ( event.target.dataset.typeName === "remove" ) {
    const ctnt = event.target.parentElement.parentElement.parentElement ;
    const index = +ctnt.dataset.index ;

    gLM.RmvItemFromList( index ) ;
    ctnt.remove() ; // Remove the parent element from the DOM

    gLM.UpdateAllItemsIndices() ;
    gLM.GetListSize() === 0 ? gLM.DeleteList() : gLM.SaveList() ;
  } // if: remove an item in the list
  else if ( event.target.dataset.typeName === "edit" ) {
    const ctnt = event.target.parentElement.parentElement ;
    const tagElem = ctnt.querySelector(".tag") ;
    const index = +ctnt.parentElement.dataset.index ;

    swal.fire({
      title: "Edit the item\'s contents:",
      inputPlaceholder: "Type item contents here",
      showCancelButton: true,
      input: "text",
      inputValue: tagElem.textContent,
      inputValidator: function(val) {
        if ( val === "" ) // blocks input until valid
          return "Item contents must NOT be empty" ;
      }
    }).then( function(val) {
      if ( ! val.isDismissed ) {
        tagElem.textContent = val.value ;
        gLM.EditItemCtnt( index, val.value ) ;
        gLM.SaveList() ;
      } // if editing permitted
    }) ;
  } // else if: get the contents of a specific item adjusted
  else if ( event.target.className === "done" ) {
    const chkbox = event.target ;
    const upCtnt = chkbox.parentElement.parentElement ;
    const tagElem = upCtnt.querySelector(".tag") ;
    const index = +upCtnt.parentElement.parentElement.dataset.index ;

    if ( chkbox.checked ) {
      tagElem.style.textDecoration = "line-through" ;
      tagElem.style.opacity = 0.5 ;
    } // if: the item has been done
    else {
      tagElem.style.textDecoration = "none" ;
      tagElem.style.opacity = 1 ;
    } // else: the item is yet to be done

    gLM.EditItemChk( index, chkbox.checked ) ;
    gLM.SaveList() ;
  } // else if: have a specific item checked / unchecked

  UpdateDropdownState() ;
}) ;

////////////////////////////////////////////
//////// BUTTON-TRIGGERED FUNCTIONS ////////
////////////////////////////////////////////

//// BUTTON 1-a: Add an item to the list by clicking the 'save list' button
document.getElementById( "addItem" ).addEventListener( "click", function() {
  let inp = document.getElementById( "inputItem" ) ;
  if ( inp.value.trim() !== "" ) {
    gLM.AddItem() ;
    gLM.SaveList() ;
    inp.value = "" ;
  } else {
    gLM.PopUpMsg( "error", "New item contents must NOT be empty" ) ;
  }

  UpdateDropdownState() ;
}) ;

//// BUTTON 1-a: Add an item to the list by pressing Enter
document.getElementById( "inputItem" ).addEventListener( "keydown", function( event ) {
  if ( event.key === "Enter" ) {
    // Prevent 'Enter' from being absorbed by web browsers
    event.preventDefault() ;
    event.stopPropagation() ;

    document.getElementById( "addItem" ).click() ;
  } // if the key is 'Enter'
}) ;

//// BUTTON 2: CLEAR THE LIST BUFFER
document.getElementById( "deleteList" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      title: 'Clear this list?',
      text: 'Doing so will remove all items\
             and cannot be undone.\
             \n\nWould you like to continue?',
      showCancelButton: true,
    }).then( async function( wantToDelete ) {
      if ( wantToDelete.isConfirmed ) {
        await gLM.ClearListBuffer() ;
        gLM.DeleteList() ;
        gLM.PopUpMsg( "success", "List cleared" ) ;
        UpdateDropdownState() ;
      }
    }) ;
  } else {
    gLM.PopUpMsg( "error", "The list is empty" ) ;
  }
}) ;

//// BUTTON 3: EXPORT AS A FILE
document.getElementById( "exportFile" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    ExportFile() ;
  } else {
    let msg ="Cannot export as a file.<br>There should be least one item in the list." ;
    gLM.PopUpMsg( "error", msg, true ) ;
  }
}) ;

//// BUTTON 4: IMPORT A FILE
document.getElementById( "importFile" ).addEventListener( "click", async function() {
  await ImportFile() ;
  UpdateDropdownState() ;
}) ;

menu.querySelectorAll("li").forEach(item => {
  item.addEventListener( "click", async () => {
    await gLM.SortItems() ;
    UpdateDropdownState() ;
    gLM.SaveList() ;
  });
});

}) ;