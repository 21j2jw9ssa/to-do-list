"use strict"

/////////////////////////////////////////
//////// FILE-HANDLING FUNCTIONS ////////
/////////////////////////////////////////

//// FUNC1: EXPORT THE LIST AS A FILE
function ExportFile() {
  try {
    swal.fire({
      title: "Enter name to download the list",
      input: "text",
      inputPlaceholder: "default: to-do list",
      showCancelButton: true,
    }).then( function(resp) {
      if ( resp.isDismissed ) ;
      else {
        let sout = "" ;                                             // text contents to store to file
        for ( let i = 0 ; i < items.length ; i++ ) {
          sout = sout.concat( items[i].textContent, ',' ) ;
          sout = sout.concat( items[i].parentElement.querySelector( "input" ).checked.toString() ) ;
          if ( i + 1 !== items.length ) sout = sout.concat('\r\n') ; // line break for each line-reading
        }
        const blob = new Blob( [sout], { type: "text/plain" } ) ;           // export type: text files
        const link = document.createElement( "a" ) ;                        // Create a temporary link element
        link.href = URL.createObjectURL( blob ) ;                           // create URL object
        link.download = ( resp.value === "" ) ? "to-do list" : resp.value ; // file naming

        // Append link to the document and trigger download
        document.body.appendChild( link ), link.click() ; 
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
    // Open file picker for files
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

    let t = Date.now() ;
    const file = await fileHandle.getFile(), text = await file.text() ;
    const lines = text.split( "\r\n" ), newList = [] ;
    console.log(`File waiting: ${(Date.now()-t)/1000} seconds`) ;

    t = Date.now() ;
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
    console.log(`File processing: ${(Date.now()-t)/1000} seconds`) ;

    if ( navigator.onLine ) {
      if ( gLM.GetListSize() > 0 ) {
        swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          title: 'Import list file?',
          text: 'Doing so will overwrite the list and become unrecoverable.\
                 \nWould you like to proceed?',
          showCancelButton: true
        }).then( function( wantToLoadFile ) {
          if ( wantToLoadFile.isConfirmed ) {
            t = Date.now() ;
            gLM.OverwriteWithNewList( newList ) ;
            console.log(`File writing: ${(Date.now()-t)/1000} seconds`) ;
            gLM.PopUpMsg( "success", "List imported successfully" )
          } // if the user clicks yes
        }) ;
      } else {
        t = Date.now() ;
        gLM.OverwriteWithNewList( newList ) ;
        console.log(`File writing: ${(Date.now()-t)/1000} seconds`) ;
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
