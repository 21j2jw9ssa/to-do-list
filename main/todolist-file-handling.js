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

//// FUNC2-a: OPEN FILE TO BROWSE TEXT FILES
async function openFile() {
  return new Promise( (resolve, reject) => {
    const input = document.createElement("input") ;
    input.type = "file" ;
    input.accept = '.txt' ;
  
    input.onchange = () => {
      const file = input.files[0] ;

      if ( file ) {
        if ( file.type === "text/plain" ) {
          resolve( file ) ;
        } else {
          reject({
            name: "FileTypeError",
            msg: `Imported file '${file.name}' is not a plain text file`
          }) ;
        }
      }
      else {
        reject( "No file selected" ) ;
      }
    };
  
    // Trigger the file input
    input.click();
  }) ;
}

//// FUNC2: IMPORT THE FILE TO GET A LIST
async function ImportFile() {
  try {
    const file = await openFile(), text = await file.text() ;
    const lines = text.split( "\r\n" ), newList = [] ;
    console.log(file) ;

    for ( let nLine = 1 ; nLine <= lines.length ; nLine++ ) {
      let curLine = lines[ nLine - 1 ] ;
      if ( curLine !== "" ) {
        let finCmaIdx = curLine.lastIndexOf(",") ;         // index of the final comma on the current line
        let ctnt = curLine.slice( 0, finCmaIdx ).trim() ;  // item's contents
        let checked = curLine.slice( finCmaIdx + 1 ).trim() ; // item's checked status
        if ( ctnt === "" ) {
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
        else if ( checked !== "true" && checked !== "false" ) {
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
        else {
          newList.push( { contents: ctnt, checked: checked === "true" } ) ;
        } // else: both the contents and the checked status are present
      } // Skip empty lines
    } // check every line in the imported file

    return new Promise( (resolve, reject) => {
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
              gLM.OverwriteWithNewList( newList ) ;
              gLM.PopUpMsg( "success", "List imported successfully" ) ;
              resolve( "Update list completed" ) ;
            } // if the user clicks yes
            else reject( "Decided not to update the list" ) ;
          }) ;
        } else {
          gLM.OverwriteWithNewList( newList ) ;
          gLM.PopUpMsg( "success", "List imported successfully" ) ;
          resolve( "Update list completed" ) ;
        }
      }
    }) ;
  } catch (err) {
    if ( err.name === "FileContentError" ) {
      gLM.PopUpMsg( "error", err.msg ) ;
    } // if: not valid list
    else if ( err.name === "FileTypeError" ) {
      gLM.PopUpMsg( "error", err.msg ) ;
    } // if: file type is not text
    else if ( err.name !== "AbortError" ) {
      gLM.PopUpMsg( "error", "Cannot import list from the file" ) ;
    } // if: error occurs without cancelling choosing a file
  }
  // }) ;
} // ImportList()
