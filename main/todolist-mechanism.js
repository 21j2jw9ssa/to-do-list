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

const items = document.getElementsByTagName( "tag" ) ;  //// "tag" items
const dropdownList = document.getElementById( "dropdown_list" ) ;

document.addEventListener( "DOMContentLoaded", function() {

function UpdateDropdownState() {
  dropdownList.disabled = items.length === 0 ;
  if ( dropdownList.disabled ) dropdownList.value = "" ;
} // UpdateDropdownState()

/////////////////////////////////////////////
//////// ITEM TRIGGERING INTEGRATION ////////
/////////////////////////////////////////////

const listBuffer = document.getElementById( "buffer" ) ;

listBuffer.addEventListener( "click", function( event ) {
  if ( event.target.classList.contains( "remove" ) ) {
    let t = Date.now() ;
    const parentElem = event.target.parentElement ; // Get the parent of the clicked ".remove" element
    const parentIndex = Array.from( parentElem.parentNode.children ).indexOf( parentElem ) ;

    gLM.RmvItemFromList( parentIndex ) ;
    parentElem.remove() ; // Remove the parent element from the DOM

    console.log( `Item removal: ${(Date.now()-t)/1000} seconds` ) ;

    gLM.UpdateAllItemsIndices() ;
  } // if: remove an item in the list
  else if ( event.target.classList.contains( "done" ) ) {
    let t = Date.now() ;
    const chkbox = event.target ;
    const tagElem = chkbox.parentElement.querySelector("tag") ;
    const index = +chkbox.parentElement.dataset.index ;

    if ( chkbox.checked ) {
      tagElem.style.textDecoration = "line-through" ;
      tagElem.style.opacity = 0.5 ;
    } // if: the item has been done
    else {
      tagElem.style.textDecoration = "none" ;
      tagElem.style.opacity = 1 ;
    } // else: the item is yet to be done

    console.log( `Property changing to: ${chkbox.checked}\n${(Date.now() - t)/1000} seconds lapsed` ) ;
    t = Date.now() ;
    gLM.EditItemChk( index, chkbox.checked ) ;

    console.log( `Item property changing: ${(Date.now() - t)/1000} seconds lapsed` ) ;
  } // else if: have a specific item checked / unchecked
  else if ( event.target.classList.contains( "edit" ) ) {
    const parentElem = event.target.parentElement ;
    const tagElem = parentElem.querySelector("tag") ;
    const index = +parentElem.dataset.index ;

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
      } // if editing permitted
    }) ;
  } // else if: get the contents of a specific item adjusted

  UpdateDropdownState() ;
}) ;

////////////////////////////////////////////
//////// BUTTON-TRIGGERED FUNCTIONS ////////
////////////////////////////////////////////

document.getElementById( "addItem" ).addEventListener( "click", function() {
  let inp = document.getElementById( "inputItem" ), val = inp.value ;
  let buf = document.getElementById( "buffer" ) ;
  if ( val !== "" ) {
    let objAttr = document.createElement("li") ;
    objAttr.draggable = true ;
    objAttr.className = "items" ; // To have the browser correctly autofilling the form

    // a checkbox
    const chkbox = document.createElement("input") ;
    chkbox.type = "checkbox" ;
    chkbox.className = chkbox.name = "done" ; // as a checkbox

    // tag for item contents
    const tagElem = document.createElement("tag") ;
    tagElem.textContent = val ;

    // an 'edit' button
    const btn1 = document.createElement("button") ;
    btn1.className = "edit" ;
    btn1.textContent = "🖊️" ; // as an edit button
    
    // a 'remove' button
    const btn2 = document.createElement("button") ;
    btn2.className = "remove" ;
    btn2.textContent = "❌" ; // as a delete button

    objAttr.append( chkbox, tagElem, " ", btn1, btn2 ) ;
    objAttr.dataset.index = buf.children.length ;

    // New item default: not checked
    buf.appendChild( objAttr ) ;
    gLM.PushItemToList( val, false ) ;
    inp.value = "" ;
  } else {
    gLM.PopUpMsg( "error", "New item contents must NOT be empty" ) ;
  }

  UpdateDropdownState() ;
}) ;

//// BUTTON 1-a: Add an item to the list by pressing Enter
document.getElementById( "inputItem" ).addEventListener( "keydown", function( event ) {
  if ( event.key === 'Enter' ) {
    // Prevent 'Enter' from being absorbed by web browsers
    event.preventDefault() ;
    event.stopPropagation() ;

    document.getElementById( "addItem" ).click() ;
  }
}) ;

// BUTTON 2: SORT ALL ITEMS IN THE LIST
dropdownList.addEventListener( "change", function() {
  if ( dropdownList.value === "magnitude_asc" )
    gLM.SortListItems( ITEM_PROPERTY.CONTENTS, ORDER.ASCENDING ) ;
  else if ( dropdownList.value === "magnitude_desc" )
    gLM.SortListItems( ITEM_PROPERTY.CONTENTS, ORDER.DESCENDING ) ;
  else if ( dropdownList.value === "checkbox_status_asc"  )
    gLM.SortListItems( ITEM_PROPERTY.CHECKBOX_STATUS, ORDER.ASCENDING ) ;
  else if ( dropdownList.value === "checkbox_status_desc" )
    gLM.SortListItems( ITEM_PROPERTY.CHECKBOX_STATUS, ORDER.DESCENDING ) ;
}) ;

//// BUTTON 3: CLEAR THE LIST BUFFER
document.getElementById( "clearBuffer" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      title: 'Clear this list?',
      text: 'Doing so will remove all items\
             and cannot be undone.\
             \n\nWould you like to proceed?',
      showCancelButton: true,
    }).then( function( wantToDelete ) {
      if ( wantToDelete.isConfirmed ) {
        gLM.DeleteList() ;
        gLM.PopUpMsg( "success", "List cleared" ) ;
        UpdateDropdownState() ;
      }
    }) ;
  } else {
    gLM.PopUpMsg( "error", "The list is empty" ) ;
    UpdateDropdownState() ;
  }

}) ;

//// BUTTON 4: SAVE THE LIST IN THE WEB BROWSER
document.getElementById( "saveFile" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    if ( gLM.GetLocalStorageStat() ) {
      swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        title: 'Save this list as a file?',
        text: 'There\'s already one saved on this site.\
               \nDoing so will overwrite the old one\
               and it\'ll be unrecoverable.\
               \n\nWould you like to proceed?',
        showCancelButton: true,
      }).then( function( wantToOverwrite ) {
        if ( wantToOverwrite.isConfirmed ) {
          gLM.SaveList() ;
          gLM.PopUpMsg( "success", "File saved successfully" ) ;
        }
      }) ;
    } else {
      gLM.SaveList() ;
      gLM.PopUpMsg( "success", "File saved successfully" ) ;
    }
  } else {
    if ( navigator.onLine ) {
      gLM.PopUpMsg( "error", "The list to save must NOT be empty." ) ;
    } else {
      alert("The list to save must NOT be empty.")
    }
  }
}) ;

//// BUTTON 5: LOAD THE LIST IN THE WEB BROWSER
document.getElementById( "loadFile" ).addEventListener( "click", function() {
  if ( gLM.GetLocalStorageStat() ) {
    if ( gLM.GetListSize() > 0 ) {
      if ( navigator.onLine ) {
        swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          title: 'Load file?',
          text: 'Doing so will overwrite the list and become unrecoverable.\
                 \nProceed anyway?',
          showCancelButton: true,
        }).then( function( wantToLoadFile ) {
          if ( wantToLoadFile.isConfirmed ) {
            const s = Date.now() ;
            gLM.CreateList();
            console.log(`Loading: ${(Date.now()-s)/1000} seconds lapsed`) ;
            UpdateDropdownState() ;
            gLM.PopUpMsg( "success", "File loaded successfully" ) ;
          }
        }) ;
      } else {
        if ( confirm( "Load file?\n\nDoing so will overwrite the list and become unrecoverable.\nProceed anyway?" ) ) {
          UpdateDropdownState() ;
          alert( "File Loaded successfully!" ) ;
        }
      }
    } else {
      const s = Date.now() ;
      gLM.CreateList() ;
      console.log(`Loading: ${(Date.now()-s)/1000} seconds lapsed`) ;
      UpdateDropdownState() ;
      gLM.PopUpMsg( "success", "File saved successfully" ) ;
    }
  } else {
    gLM.PopUpMsg( "error", "No local file stored" ) ;
  }

  // UpdateDropdownState() ;
}) ;

//// BUTTON 6: DELETE THE FILE IN THE WEB BROWSER (i.e. THE LIST ITSELF)
document.getElementById( "clearFile" ).addEventListener( "click", function() {
  if ( gLM.GetLocalStorageStat() ) {
    swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      title: 'Delete the local file?',
      text: 'It will destroy the file\
             and cannot be undone.\
             \n\nWould you like to proceed?',
      showCancelButton: true,
    }).then( function( wantToDeleteFile ) {
      if ( wantToDeleteFile.isConfirmed ) {
        localStorage.removeItem( gLM.GetLocalStorageName() );
        gLM.PopUpMsg( "success", "File deleted successfully" ) ;
      }
      UpdateDropdownState() ;
    }) ;
  //   Standard Method:
  //   if (confirm(`Are you sure that you want to delete the local file?\nThis can't be undone.`)) {
  //     localStorage.removeItem( gLM.GetLocalStorageName() );
  //     alert("File deleted!");
  //   }
  } else {
    gLM.PopUpMsg( "error", "There is no local list file" ) ;
    UpdateDropdownState() ;
  }

  // UpdateDropdownState() ;
}) ;

//// BUTTON 7: EXPORT AS A FILE
document.getElementById( "exportFile" ).addEventListener( "click", function() {
  if ( items.length > 0 ) {
    ExportFile() ;
  } else {
    gLM.PopUpMsg( "error", "Cannot export as a file.\nThere should be least one item in the list." ) ;
  }
}) ;

//// BUTTON 8: IMPORT A FILE
document.getElementById( "importFile" ).addEventListener( "click", function() {
  ImportFile() ;
  UpdateDropdownState() ;
}) ;

}) ;
