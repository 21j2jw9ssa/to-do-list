"use strict"

/////////////////////////////////////////
//////// FILE-HANDLING FUNCTIONS ////////
/////////////////////////////////////////

//// FUNC1: EXPORT THE LIST AS A FILE
function ExportFile() {
  try {
    swal({
      text: "File name to save (default: \"to-do list\"):",
      content: 'input',
      buttons: true,
    }).then( function( value ) {
      if ( value === null ) ;
      else {
        let sout = "" ;                                             // text contents to store to file
        for ( let i = 0 ; i < items.length ; i++ ) {
          sout = sout.concat( items[i].textContent, ',' ) ;
          sout = sout.concat( items[i].parentElement.querySelector( "input" ).checked.toString() ) ;
          if ( i + 1 !== items.length ) sout = sout.concat('\r\n') ;
        }
        const blob = new Blob( [sout], { type: "text/plain" } ) ;   // export type: text files
        const link = document.createElement( "a" ) ;                // Create a temporary link element
        link.href = URL.createObjectURL( blob ), link.download = ( value === "" ) ? "to-do list" : value ;

        document.body.appendChild( link ), link.click() ; // Append link to the document and trigger download
        document.body.removeChild( link ), URL.revokeObjectURL( link.href ) ; // Clean up
      } // edition permitted
    }) ;
  } catch ( err ) {
    gLM.PopUpMsg( "error", "Failed to save file." ) ;
  } // catch:
} // SaveAsTextFile()

//// FUNC2: IMPORT THE FILE TO GET A LIST
async function ImportFile() {
  try {
    // Open file picker for text files
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        { // acceptable file type 1: text/plain
          description: 'text files',
          accept: { 'text/plain': ['.txt'] }
        },
        { // acceptable file type 2: csv
          description: 'CSV files',
          accept: { 'text/csv': ['.csv'] }
        },
        { // acceptable file type 3: rich-text files
          description: 'rich-text files',
          accept: { 'text/markdown': ['.rtf'] }
        }
      ]
    }) ;

    const file = await fileHandle.getFile(), text = await file.text() ;
    const lines = text.split( "\r\n" ), newList = [] ;

    for ( let nLine = 1 ; nLine <= lines.length ; nLine++ ) {
      let curLine = lines[ nLine - 1 ] ;
      if ( curLine !== "" ) {
        let finCmaIdx = curLine.lastIndexOf(",") ;         // index of the final comma on the current line
        let ctnt = curLine.slice( 0, finCmaIdx ).trim() ;  // item's contents
        let checked = curLine.slice( finCmaIdx + 1 ).trim() ; // item's checked status
        if ( checked !== "true" && checked !== "false" ) {
          throw { // throws an FileContentError pointing out the invalid/missing checked status
            name: "FileContentError",
            msg:
              `\
              Error happened when reading line ${nLine}:

              ${curLine}

              The checked status must be 'true' or 'false'.

              Instead, we received ${ ( checked !== "" ) ? "" : "there is"}
              ${ ( checked !== "" ) ? `'${checked}'` : "no checked status" }
              `
          } ;
        } // if the checked property is NEITHER true nor false
        else if ( ctnt === "" ) {
          throw { // throws an FileContentError pointing out the empty contents
            name: "FileContentError",
            msg:
              `\
              Error happened when reading line ${nLine}:

              ${curLine}

              The item contents must NOT be empty.
              `
          } ;
        } // if the item contents is EMPTY
        else {
          newList.push( { contents: ctnt, checked: checked === "true" } ) ;
        } // else: both the contents and the checked status are present
      } // Skip empty lines
    } // check every line in the imported file

    if ( navigator.onLine ) {
      if ( gLM.GetListSize() > 0 ) {
        swal({
          closeOnEsc: false,
          closeOnClickOutside: false,
          title: 'Load file?',
          text: 'Doing so will overwrite the list and become unrecoverable.\
                 \nProceed anyway?',
          buttons: true,
        }).then( function( wantToLoadFile ) {
          if ( wantToLoadFile ) {
            gLM.OverwriteWithNewList( newList ) ;
            gLM.PopUpMsg( "success", "List imported successfully" )
          } // if the user clicks yes
        }) ;
      } else {
        gLM.OverwriteWithNewList( newList ) ;
        gLM.PopUpMsg( "success", "List imported successfully" ) ;
      }
    }

    return true ; // import succeeds
  } catch (err) {
    if ( err.name === "FileContentError" ) {
      gLM.PopUpMsg( "error", err.msg ) ;
    } // if: not valid list
    else if ( err.name !== "AbortError" ) {
      gLM.PopUpMsg( "error", "Cannot import list from the file" ) ;
    } // if: not abort errors
  }
} // ImportList()
