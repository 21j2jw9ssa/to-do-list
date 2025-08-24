const InsertTableCtnt = ( file, id ) => {
  fetch(file).then( response => response.text() )
    .then( html => {
      const fin = [] ;
      const lines = html.split("\r\n") ;

      lines.forEach( s => { fin.push( s.split(",") ) ; } ) ;

      const header = document.createElement("thead") ;
      const body = document.createElement("tbody") ;

      // Build headers
      for ( let i = 0 ; i < fin[0].length ; i++ ) {
        const col = document.createElement("th") ;
        col.textContent = fin[0][i] ;
        header.append(col) ;
      }

      // Build body cells
      for ( let i = 1 ; i < fin.length ; i++ ) {
        const row = document.createElement("tr") ;
        for ( let cellContent of fin[i] ) {
          const col = document.createElement("td") ;
          col.textContent = cellContent ;
          row.append(col) ;
        }
        body.append(row) ;
      }

      // Build a table using already-built headers and body cells
      document.getElementById(id).append(header, body) ;
    }
  ) ;
} ;

const useFolder = "../list examples to import/" ;

const sortType = [  // Examples in order:
  "magnitude_asc",  // - from smallest to largest
  "magnitude_desc", // - from largest to smallest
  "checkbox_asc",   // - from latest done to earliest done
  "checkbox_desc"   // - from earliest done to latest done
] ;

for ( let i of sortType ) {
  InsertTableCtnt( `${useFolder}${i}_eg1_before.csv`, `${i}_eg1_before_sort` ) ;
  InsertTableCtnt( `${useFolder}${i}_eg1_after.csv`,  `${i}_eg1_after_sort` ) ;
  InsertTableCtnt( `${useFolder}${i}_eg2_before.csv`, `${i}_eg2_before_sort` ) ;
  InsertTableCtnt( `${useFolder}${i}_eg2_after.csv`,  `${i}_eg2_after_sort` ) ;
  InsertTableCtnt( `${useFolder}${i}_eg3_before.csv`, `${i}_eg3_before_sort` ) ;
  InsertTableCtnt( `${useFolder}${i}_eg3_after.csv`,  `${i}_eg3_after_sort` ) ;
}