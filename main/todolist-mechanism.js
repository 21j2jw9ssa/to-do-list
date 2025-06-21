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

document.addEventListener( "DOMContentLoaded", function() {

/////////////////////////////////////////////
//////// ITEM TRIGGERING INTEGRATION ////////
/////////////////////////////////////////////

document.body.addEventListener( "click", function( event ) {
  if ( event.target && event.target.classList.contains( "remove" ) ) {
    const parentElement = event.target.parentElement ; // Get the parent of the clicked ".remove" element
    const parentIndex = Array.from( parentElement.parentNode.children ).indexOf( parentElement ) ;

    gLM.RmvItemFromList( parentIndex ) ;
    parentElement.remove() ; // Remove the parent element from the DOM
  } // if: remove an item in the list
  else if ( event.target && event.target.classList.contains( "done" ) ) {
    const chkbox = event.target, tagElem = chkbox.parentElement.querySelector("tag") ;
    tagElem.style.textDecoration = chkbox.checked ? "line-through" : "none" ;
    tagElem.style.opacity = chkbox.checked ? 0.5 : 1 ;
    for ( let i = 0; i < items.length; i++ ) {
      if ( document.querySelectorAll( ".done" )[i].checked !== gLM.GetList()[i].checked )
        gLM.EditItemChk( i, chkbox.checked ) ;
    }
  } // else if: have a specific item checked / unchecked
  else if ( event.target && event.target.classList.contains( "edit" ) ) {
    swal({
      text: "Edit the item\'s contents:",
      content: 'input',
      buttons: true,
    }).then( function(value) {
      if ( value === null ) ;
      else if ( value === '' ) {
        gLM.PopUpMsg( "error", "An item shouldn\'t be empty" ) ;
      } else {
        const parentElement = event.target.parentElement ;
        parentElement.querySelector("tag").textContent = value ;
        gLM.EditItemCtnt( Array.from(parentElement.parentNode.children).indexOf(parentElement), value ) ;
      } // editing permitted
    }) ;
  } // else if: get the contents of a specific item adjusted

//   MandatorySaveFile() ;
}) ;

////////////////////////////////////////////
//////// BUTTON-TRIGGERED FUNCTIONS ////////
////////////////////////////////////////////

//// BUTTON 1: Add an item to the list
document.getElementById( "addItem" ).addEventListener( "click", function() {
  let val = document.getElementById("inputItem").value ;
  if ( val !== "" ) {
    if ( ! gLM.GetList().some( item => item.item === val ) ) {
      let objAttr = document.createElement("li") ;
      objAttr.draggable = true ;
      objAttr.className = "items" ; // To have the browser correctly autofilling the form

      // btn1: button for content editing
      // btn2: button for content removal
      // chkbox: checking if the item has been done
      // tagElem: item's contents
      let btn1 = document.createElement("button"), btn2 = document.createElement("button") ;
      let chkbox = document.createElement("input"), tagElem = document.createElement("tag") ;
      btn1.className = "edit", btn1.textContent = "edit" ; // as an edit button
      btn2.className = "remove", btn2.textContent = "X" ; // as a delete button
      chkbox.type = "checkbox", chkbox.className = chkbox.name = "done" ; // as a checkbox
      tagElem.textContent = val ;

      objAttr.append( chkbox, tagElem, btn1, btn2 ) ;

      // New item default: not checked
      document.getElementById( "buffer" ).appendChild( objAttr ) ;
      gLM.PushItemToList( val, false ) ;
      document.getElementById( "inputItem" ).value = "" ;
    } // if: Check if the item already exists in the list
    else {
      gLM.PopUpMsg( "error", "The new item cannot be the same as anything in this list" ) ;
    }
  } else {
    gLM.PopUpMsg( "error", "The new item shouldn\'t be empty" ) ;
  }
}) ;

//// BUTTON 1-a: Add an item to the list by pressing Enter
document.getElementById( "inputItem" ).addEventListener( "keydown", function( event ) {
  if ( event.key === 'Enter') document.getElementById("addItem").click() ;
}) ;

//// BUTTON 2: SORT ALL ITEMS IN THE LIST
document.getElementById( "sortItems" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() <= 0 ) {
    gLM.PopUpMsg( "error", "This list is empty" ) ;
  } else {
    swal({
      title: "You clicked the \'sort items\' button.",
      text:  "How would you sort all items in this list?",
      closeOnClickOutside: false,
      buttons: {
        closeOnEsc: false,
        closeOnClickOutside: false,
        ascending:  { text: "in ascending order"   },
        descending: { text: "in descending order"  },
        random:     { text: "randomly"      },
        cancel: "none of above",
      },
    }).then( function( value ) {
      switch ( value ) {
        case "ascending" :  gLM.SortListItemsASC() ;  break ;
        case "descending" : gLM.SortListItemsDSC() ;  break ;
        case "random" :     gLM.SortListItemsRand() ; break ;
        default: return ;
      }
      gLM.PopUpMsg( "success", "Sort completed" ) ;
    }) ;
  }
}) ;

//// BUTTON 3: CLEAR THE LIST BUFFER
document.getElementById( "clearBuffer" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    swal({
      closeOnEsc: false,
      closeOnClickOutside: false,
      title: 'Clear this list?',
      text: 'Doing so will remove all items\
             and cannot be undone.\
             \n\nWould you like to proceed?',
      dangerMode: true,
      buttons: true,
    }).then( function( wantToDelete ) {
      if ( wantToDelete ) {
        gLM.DeleteList() ;
        gLM.PopUpMsg( "success", "List cleared" ) ;
      }
    }) ;
  } else {
    if ( navigator.onLine ) {
      gLM.PopUpMsg( "error", "The list is empty" ) ;
    }
    else {
      // AlertError( "The list buffer's empty" );
    }
  }
}) ;

//// BUTTON 4: SAVE THE LIST IN THE WEB BROWSER
document.getElementById( "saveFile" ).addEventListener( "click", function() {
  if ( gLM.GetListSize() > 0 ) {
    if ( gLM.GetLocalStorageStat() ) {
      swal({
        closeOnEsc: false,
        closeOnClickOutside: false,
        title: 'Save this list as a file?',
        text: 'There\'s already one saved on this site.\
               Doing so will overwrite the old one\
               and it\'ll be unrecoverable.\
               \n\nWould you like to proceed?',
        buttons: true,
      }).then( function( wantToOverwrite ) {
        if ( wantToOverwrite ) {
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
      gLM.PopUpMsg( "error", "The list to save can\'t be empty." ) ;
    } else {
      alert("The list to save can\'t be empty.")
    }
  }
}) ;

//// BUTTON 5: LOAD THE LIST IN THE WEB BROWSER
document.getElementById( "loadFile" ).addEventListener( "click", function() {
  if ( gLM.GetLocalStorageStat() ) {
    if ( gLM.GetListSize() > 0 ) {
      if ( navigator.onLine ) {
        swal({
          closeOnEsc: false,
          closeOnClickOutside: false,
          title: 'Load file?',
          text: 'Doing so will overwrite the list and become unrecoverable.\
                 \nProceed anyway?',
          buttons: true,
        }).then( function( wantToLoadFile ) {
          if ( wantToLoadFile ) {
            gLM.CreateList();
            gLM.PopUpMsg( "success", "File loaded successfully" ) ;
          }
        //   MandatorySaveFile() ;
        }) ;
      } else {
        // if ( confirm( "Load file?\n\nDoing so will overwrite the list and become unrecoverable.\nProceed anyway?" ) )
        //   alert( "File Loaded successfully!" ) ;
      }
    } else {
      gLM.CreateList() ;
      if ( navigator.onLine ) {
        gLM.PopUpMsg( "success", "File saved successfully" ) ;
      } else {
        alert( "File loaded successfully!" ) ;
      }
    }
  } else {
    gLM.PopUpMsg( "error", "No local file stored" ) ;
  }
}) ;

//// BUTTON 6: DELETE THE FILE IN THE WEB BROWSER (i.e. THE LIST ITSELF)
document.getElementById( "clearFile" ).addEventListener( "click", function() {
  if ( gLM.GetLocalStorageStat() ) {
    swal({
      closeOnEsc: false,
      closeOnClickOutside: false,
      title: 'Delete the local file?',
      text: 'It will destroy the file\
             and cannot be undone.\
             \n\nWould you like to proceed?',
      dangerMode: true,
      buttons: true,
    }).then( function( wantToDeleteFile ) {
      if ( wantToDeleteFile ) {
        localStorage.removeItem( gLM.GetLocalStorageName() );
        gLM.PopUpMsg( "success", "File deleted successfully" ) ;
      }
    }) ;
  //   Standard Method:
  //   if (confirm(`Are you sure that you want to delete the local file?\nThis can't be undone.`)) {
  //     localStorage.removeItem( gLM.GetLocalStorageName() );
  //     alert("File deleted!");
  //   }
  } else {
    gLM.PopUpMsg( "error", "There is no local list file" ) ;
  //   AlertError("there's no such file");
  }
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
}) ;

}) ;
