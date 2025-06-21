"use strict"
// PUBLIC, PRIVATE, UNDECIDED
/**
 * Global list manager
 */
const gLM = ( function() {
  /**
   * The key where the `localStorage` interface points at
   * 
   * By default, it uses 'listFile' as the name for `localStorage` function
   * 
   * @type `String` name where localStorage stores data at
   */
  const localStorageName = "listFile" ; // PRIVATE

  /**
   * The array to store list items
   * 
   * Each tuple `{contents: String, checked: boolean}` represents an item in the list.
   * 
   * @type_1 `String` the item's contents
   * @type_2 `boolean` if the item is checked or not
   */
  const gList = [] ; // PRIVATE

  /**
   * @type `Integer` index of a specific item before being dragged
   */
  let initIdx = null ; // PRIVATE

  /**
   * @type `Integer` index of a specific item after being dragged
   */
  let finIdx = null ; // PRIVATE

  /////////////////////////////////////
  //////// INTERNAL OPERATIONS ////////
  /////////////////////////////////////
  
  /**
   * Change properties of a specific list item.
   * 
   * @param {Integer} idx index where the item editing starts at; must not be smaller than zero
   * @param {String} ctnt item content to change to
   * @param {boolean} chk checked property to change to
   */
  function EditItemProperty( idx, ctnt, chk ) {
    if ( idx === null ) throw Error( "missing index value, which is necessary to call this method." ) ;
    if ( idx < 0 ) throw Error( "index must NOT be smaller than zero, but received", idx ) ;
    if ( ctnt !== null ) gList[ idx ].contents = ctnt ;
    if ( chk !== null ) gList[ idx ].checked = chk ;
  } // PRIVATE

  /**
   * Move a list item to a location of different index in the list array.
   * 
   * A item's movement causes the affected items to shift together,
   * with the latter's sequence unchanged.
   * 
   * @param {Integer} st the current index where the idem sits at
   * @param {Integer} end the target index where the idem is to sit at
   */
  function MoveItem( st, end ) {
    if ( st < 0 || end < 0 ) throw Error( `Indices must NOT be smaller than 0, but got st: ${st} and end: ${end}` ) ;
    if ( st === end ) throw Error( `Indices must be different, but both are ${st}` ) ;

    // v1 and v4: unaffected items
    // v2 and v3:
    // when the item moves left: v3 is the item to move, with v2 to shift right
    // when the item moves right: v2 is the item to move, with v3 to shift left
    let v1 = gList.slice( 0, ( st < end ? st : end ) ) ;
    let v2 = gList.slice( ( st < end ? st : end ), st + ( st < end ? 1 : 0 ) ) ;
    let v3 = gList.slice( st + ( st < end ? 1 : 0 ), ( st < end ? end : st ) + 1 ) ;
    let v4 = gList.slice( ( st < end ? end : st ) + 1, gLM.GetListSize() ) ;

    gList.splice( 0, gList.length ) ;

    // The only parts changing is v2 and v3, which is to exchange location in this array with each other
    gList.push.apply( gList, v1 ), gList.push.apply( gList, v3 ) ;
    gList.push.apply( gList, v2 ), gList.push.apply( gList, v4 ) ;
  } // PRIVATE

  /**
   * Have two items exchange location with each other in the list
   * 
   * The result is the same even if the values of idx1 and idx2 swap with each other
   * 
   * @param {Number} idx1 index of the first item to be swapped
   * @param {Number} idx2 index of the second item to be swapped
   */
  function SwapItems( idx1, idx2 ) {
    let tempText = gList[idx1] ;
    gList[idx1] = gList[idx2], gList[idx2] = tempText ;
  } // PRIVATE

  /**
   * Swaps two adjcent list items.
   * 
   * Index of the first item is `i`, whereas the second one is `i+1`.
   * 
   * Index of the next item must be smaller than the length of the list.
   * 
   * @param {Integer} i index of first item to be swapped
   */
  function SwapAdjItems( i ) { SwapItems( i, i + 1 ) ; } // PRIVATE

  /**
   * Remove all items in the item list without affecting the one stored in `localStorage`
   */
  function ClearList() { gList.splice( 0, gList.length ) ; } // PRIVATE

  
  /**
   * Remove all items in the list (buffer)
   */
  function ClearBuffer() {
    let buff = document.getElementById( "buffer" ) ;
    buff.textContent = "" ;
  } // ClearBuffer() PRIVATE

  //// FUNC7: SAVE FILE WITH SWAL POPUP ALERTS
  function MandatorySaveFile() {
    localStorage.setItem( gLM.GetLocalStorageName(), gList ) ;
    swal({
      title: "File content:",
      text: `${localStorage.getItem( gLM.GetLocalStorageName() )}`,
      icon: 'info'
    }) ;
  } // MandatorySaveFile() PRIVATE

  //// FUNC8: POP-UP ALERTS
  function AlertError( ctnt ) { alert( "Error: ", ctnt ) ; } // PRIVATE

  /**
   * FUNC1: parse JSON object string saved in the web browser
   * 
   * Read item stored in `localStorage` and write them to the list
   */
  function ReadStringsIntoTheList() {
    let startKey = 0, w1, jsonLays = 0, localStorageStr = localStorage.getItem( localStorageName ) ;
    ClearList() ;
    for ( let n = 0; n <= localStorageStr.length; n++ ) {
      if ( localStorageStr[n] === '{' ) jsonLays++ ;
      if ( ( localStorageStr[n] === ',' && jsonLays === 0 ) || n === localStorageStr.length ) {
        w1 = `${ localStorageStr.slice( startKey, n ) }` ;
        let item = JSON.parse(w1) ;
        gLM.PushItemToList( item.contents, item.checked ) ;
        startKey = n + 1 ;
      } // if: detect a comma not in a string or reach the end of the localStorage string

      if ( localStorageStr[n] === '}' ) jsonLays-- ;
    } // for: every character in the localStorage string
  } // ReadStringsIntoTheList() PRIVATE

  //// FUNC2: WRITE ALL WORD STRINGS ONE BY ONE TO THE LIST BUFFER
  function WriteAllItemsIntoTheList() {
    for ( let n = 0 ; n < gList.length ; n++ ) {
      let objAttr = document.createElement("li") ;
      objAttr.draggable = true ;
      objAttr.className = "items" ; // To have the browser correctly autofilling the form

      // btn1: the edit button
      // btn2: the remove button
      // chkbox: checking if the item has been done
      // tagElem: item's contents
      let btn1 = document.createElement("button"), btn2 = document.createElement("button") ;
      let chkbox = document.createElement("input"), tagElem = document.createElement("tag") ;
      btn1.className = "edit", btn1.textContent = "edit" ;
      btn2.className = "remove", btn2.textContent = "X" ;
      chkbox.type = "checkbox", chkbox.className = chkbox.name = "done" ;
      tagElem.textContent = gList[n].contents ;

      objAttr.append( chkbox, tagElem, " ", btn1, btn2 ) ;

      document.getElementById("buffer").append( objAttr ) ;

      document.querySelectorAll(".done")[n].checked = gList[n].checked ;
      if ( document.querySelectorAll(".done")[n].checked ) {
        document.querySelectorAll("tag")[n].style.textDecoration = gList[n].checked ? "line-through" : "none" ;
        document.querySelectorAll("tag")[n].style.opacity = gList[n].checked ? 0.5 : 1 ;
      } // if the item is checked
    } // for: each item
  } // WriteAllItemsIntoTheList() PRIVATE

  return {
    // The following methods are PUBLIC.
    /**
     * Inserts multiple items at once into the list array.
     * 
     * @param  {...any} elem elements to insert into the list 
     */
    PushItemToList( ctnt, chked ) { gList.push( { contents: ctnt, checked: chked } ) ; },  // PUBLIC

    /**
     * Remove a specific number of items in the item list
     * @param {Integer} st the index where the deletion starts at
     * @param {Integer} count number of items to remove
     */
    RmvItemsFromList( st, count ) { gList.splice( st, count ) ; }, // PUBLIC

    RmvItemFromList( st ) { gList.splice( st, 1 ) ; }, // PUBLIC

    /**
     * Change the contents of a specific item without affecting its check property.
     * 
     * @param {Integer} idx index where the editting item starts at; must not be smaller than zero
     * @param {String} ctnt item content to change to
     */
    EditItemCtnt( idx, ctnt ) { EditItemProperty( idx, ctnt, null ) ; }, // PUBLIC
    
    /**
     * Change the checking property of a specific item with its contents unchanged.
     * 
     * @param {Integer} idx index where the editting item starts at; must not be smaller than zero
     * @param {boolean} chk checked property to change to
    */
    EditItemChk( idx, chk )   { EditItemProperty( idx, null, chk ) ; }, // PUBLIC

    MoveItemInsideTheList() {
      if ( this.ItemDraggedToDifIdx() ) MoveItem( initIdx, finIdx ) ;
      finIdx = initIdx = null ;
    }, // PUBLIC

    /**
     * Saves list of items to the key `LocalStorage` pointing at.
     * Different browsers, users, desktop numbers result in
     * DIFFERENT storages.
     */
    SaveList() {
      localStorage.setItem( localStorageName, gList.map( function(item) {
        return ( typeof item === "object" && item !== null ) ? JSON.stringify(item) : String(item)
      })) ;
    }, // PUBLIC

    /**
     * Remove all items in the item list without affecting the one stored in `localStorage`
     */
    DeleteList() {
      ClearBuffer() ;
      ClearList() ;
    }, // PUBLIC

    /**
     * Overwrite the old list with a new one once loaded from `localStorage`.
     */
    OverwriteWithNewList( newList ) {
      ClearBuffer() ;
      ClearList() ;
      gList.push.apply( gList, newList ) ;
      WriteAllItemsIntoTheList();
    }, // PUBLIC

    ItemDraggedToDifIdx() { return finIdx !== initIdx ; },

    //// FUNC3: CREATE A LIST OF WORD STRINGS ON THE LIST BUFFER
    CreateList() {
      if ( document.getElementById( "buffer" ).textContent !== "" )
        ClearBuffer() ;
      ReadStringsIntoTheList() ; // READ THE LOCAL FILE
      WriteAllItemsIntoTheList() ; // THEN WRITE IT TO THE LIST
    }, // CreateList()

    //// FUNC4: SORT ALL ITEMS INSIDE A LIST BUFFER IN ASCENDING ORDER
    SortListItemsASC() {
      ClearBuffer() ;

      const stack = [ 0, gList.length - 1 ] ; // Use `-2` because pairs are two elements

      while ( stack.length > 0 ) {
        const end = stack.pop(), start = stack.pop() ;
        if ( start >= end ) continue ;
    
        let i = start - 1 ; // Start at the pair before the first
        for ( let j = start ; j < end ; j += 1 ) {
          if ( gList[j].contents.localeCompare( gList[end].contents ) < 0 ) {
            SwapItems( ++i, j ) ;
          } // if the current content is smaller than the pivot
        }

        SwapItems( i + 1, end ) ; // Move pivot pair ( index i + 2 ) to its correct position
        stack.push( start, i, i + 2, end ) ; // Push left and right partition indices
      } // while stack isn't empty

      WriteAllItemsIntoTheList() ;
    }, // SortListItemsASC(): via quicksort for efficiency

    //// FUNC5: SORT ALL ITEMS INSIDE A LIST BUFFER IN DESCENDING ORDER
    SortListItemsDSC() {
      ClearBuffer() ;

      const stack = [ 0, gList.length - 1 ] ; // Use `-2` because pairs are two elements
    
      while ( stack.length > 0 ) {
        const end = stack.pop(), start = stack.pop() ;
        if ( start >= end ) continue ;
    
        let i = start - 1 ; // Start at the pair before the first
        for ( let j = start ; j < end ; j += 1 ) {
          if ( gList[j].contents.localeCompare( gList[end].contents ) > 0 ) {
            SwapItems( ++i, j ) ;
          } // if the current content is smaller than the pivot
        }
    
        SwapItems( i + 1, end ) ; // Move pivot pair ( index i + 2 ) to its correct position
        stack.push( start, i, i + 2, end ) ; // Push left and right partition indices
      } // while stack isn't empty

      WriteAllItemsIntoTheList() ;
    }, // SortListItemsDSC(): via quicksort for efficiency

    //// FUNC6: SORT ALL ITEMS INSIDE A LIST BUFFER IN A RANDOM MANNER 
    SortListItemsRand() {
      ClearBuffer() ;
      for ( let c = gList.length ; c > 1 ; ) {
        let idx = Math.floor( Math.random() * c ) ;
        SwapItems( idx, --c ) ;
      } // for:
      WriteAllItemsIntoTheList() ;
    }, // SortListItemsRand(): via Fisher–Yates shuffle for the absence of bias

    //// FUNC9: POP-UP WINDOWS
    PopUpMsg( type, msg ) {
      type = type.trim().toLowerCase() ;
      try {
        // Allow nothing except the following types:
        // error, warning, success, info
        if ( ! [ "error","warning","success","info" ].includes(type) ) throw `Type must be one of the following:\nerror, warning, success, info,\nInstead receiving an invalid type: ${type}` ;
        swal({
          closeOnEsc: false,
          closeOnClickOutside: false,
          title: type.slice(0, 1).toUpperCase().concat( type.slice(1, type.length) ),
          text: msg, 
          icon: type,
        }) ;
      } catch (err) {
        console.error( err ) ;
      }
    }, // PopUpMsg()

    /////////////////////////
    //////// SETTERS ////////
    /////////////////////////

    /**
     * Setting index of the dragged item
     * when STARTING to be dragged
     * @param {Number} i index of item to be dragged
     */
    SetDragStartIdx( i ) { initIdx = i ; },

    /**
     * Setting index of the dragged item
     * when FINISHING being dragged
     * @param {Number} i index of item being dragged
     */
    SetDragEndIdx( i ) { finIdx = i ; },

    /////////////////////////
    //////// GETTERS ////////
    /////////////////////////

    /**
     * Access a copy of the list array.
     * @returns gList
     */
    GetList() { return gList ; },

    GetInitIdx() { return initIdx ; },

    Getdx() { return finIdx ; },

    GetListSize() { return gList.length ; },

    GetLocalStorageName() { return localStorageName ; },

    GetLocalStorageStat() { return localStorage.getItem( localStorageName ) ; },

    //////////////////////////////////////////////
    //////// BASIC APPLICATION OPERATIONS ////////
    //////////////////////////////////////////////

  } // return: public members and methods 
})() ; // gLM singleton
