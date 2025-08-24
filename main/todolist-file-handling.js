"use strict"

/////////////////////////////////////////
//////// FILE-HANDLING FUNCTIONS ////////
/////////////////////////////////////////

/**
 * Export the collection of all items in the list buffer
 * as a file
 * 
 * On iOS, given is a preview of a file to download
 */
function ExportFile() {
  try {
    swal.fire({
      title: "Enter name to download the list",
      input: "text",
      inputPlaceholder: "default: to-do list",
      showCancelButton: true,
    }).then( function(resp) {
      if ( ! resp.isDismissed ) {
        let sout = "" ;                                             // text contents to store to file
        for ( let i = 0 ; i < items.length ; i++ ) {
          sout = sout.concat( items[i].textContent, ',' ) ;
          sout = sout.concat( items[i].parentElement.querySelector( "input" ).checked.toString() ) ;
          if ( i + 1 !== items.length ) sout = sout.concat('\r\n') ; // line break for each line-reading
        }

        const blob = new Blob( [sout], { type: "text/plain" } ) ;           // export type: plain text
        const link = document.createElement( "a" ) ;                        // create a temporary link
        link.href = URL.createObjectURL( blob ) ;                           // create URL object
        link.download = ( resp.value === "" ) ? "to-do list" : resp.value ; // generate file name

        // Append link to the document and trigger download
        document.body.appendChild( link ), link.click() ; 
        document.body.removeChild( link ), URL.revokeObjectURL( link.href ) ; // Clean up
      } // edition permitted
    }) ;
  } catch ( err ) {
    gLM.PopUpMsg( "error", "Failed to save file." ) ;
  } // catch:
} // SaveAsTextFile()

/**
 * Opens a file to have a user select the desired file
 */
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

/**
 * Imports a file to form a list in the list buffer
 */
async function ImportFile() {
  try {
    const file = await openFile(), text = await file.text() ;
    const lines = text.split( "\r\n" ) ; // to split file content into lines
    const newList = [] ;

    for ( let nLine = 1 ; nLine <= lines.length ; nLine++ ) {
      let curLine = lines[ nLine - 1 ] ;
      if ( curLine !== "" ) {
        let finCmaIdx = curLine.lastIndexOf(",") ;            // find the final comma on the current line
        let ctnt = curLine.slice( 0, finCmaIdx ).trim() ;     // item's contents
        let checked = curLine.slice( finCmaIdx + 1 ).trim() ; // item's checkbox status
        if ( ctnt === "" ) {
          throw { // throws an FileContentError pointing out the empty contents
            name: "FileContentError",
            msg:
              `\
              Error happened when reading line ${nLine}:<br><br>
              ${curLine}<br><br>
              The item contents must NOT be empty.
              `
          } ;
        } // if the item contents is EMPTY
        else if ( checked !== "true" && checked !== "false" ) {
          throw { // throws an FileContentError pointing out the invalid/missing checkbox status
            name: "FileContentError",
            msg:
              `\
              Error happened when reading line ${nLine}:<br><br>
              ${curLine}<br><br>
              The checked status must be 'true' or 'false'.<br><br>
              Instead, we received ${ ( finCmaIdx !== -1 ) ? "" : "there is"}
              ${ ( finCmaIdx !== -1 ) ? `'${checked}'` : "no checked status" }
              `
          } ;
        } // if the checked property is NEITHER true nor false
        else {
          newList.push( { contents: ctnt, checked: checked === "true" } ) ;
        } // else: both the contents and the checked status are present
      } // Skip empty lines
    } // check every line in the imported file

    return new Promise( async (resolve) => {
      if ( gLM.GetListSize() > 0 ) {
        swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          title: 'Import list file?',
          text: 'It will overwrite the list and become unrecoverable.\
                 \nWould you like to continue?',
          showCancelButton: true
        }).then( async function( wantToLoadFile ) {
          if ( wantToLoadFile.isConfirmed ) {
            await gLM.OverwriteWithNewList( newList ) ;
            gLM.PopUpMsg( "success", "List imported successfully" ) ;
            gLM.SaveList() ;
            resolve() ;
          } // if: the user clicks yes
          else console.log( "Declined to update the list" ) ;
        }) ;
      } else {
        await gLM.OverwriteWithNewList( newList ) ;
        gLM.PopUpMsg( "success", "List imported successfully" ) ;
        gLM.SaveList() ;
        resolve() ;
      }
    }) ;
  } catch (err) {
    if ( err.name === "FileContentError" )   // occurs if found errors
      gLM.PopUpMsg( "error", err.msg, true ) ;
    else if ( err.name === "FileTypeError" ) // occurs when file type is not plain text
      gLM.PopUpMsg( "error", err.msg, true ) ;
    else if ( err.name !== "AbortError" )    // occurs while choosing a file
      gLM.PopUpMsg( "error", "Cannot import list from the file" ) ;
  }
} // ImportList()