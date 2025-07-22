"use strict"

const ORDER = {
  ASCENDING: "ASS",
  DESCENDING: "DES CHIFUMIFUMI",
}

const ITEM_PROPERTY = {
  CONTENTS: "BWVIOHQOQHOQJPQJPN",
  CHECKBOX_STATUS: "Uqppaad vqwvuqwiwfvibqwbiw",
} ;

Object.freeze( ORDER, ITEM_PROPERTY ) ;

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
   * Each JSON tuple `{contents: String, checked: boolean}` represents an item in the list.
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
   * Remove all items in the item list
   * without affecting the one stored in `localStorage`
   */
  function ClearList() { gList.splice( 0, gList.length ) ; } // PRIVATE

  /**
   * Remove all items in the list (buffer)
   */
  function ClearBuffer() {
    const dirtyBlanker = "" ;
    const cleanyBlanky = DOMPurify.sanitize(dirtyBlanker) ;
    document.getElementById("buffer").innerHTML = cleanyBlanky ;
  } // ClearBuffer() PRIVATE

  /**
   * Read item stored in `localStorage` in the web browser
   * and write them to the list
   */
  function ReadStringsIntoTheList() {
    gList.push.apply( gList,
      JSON.parse( localStorage.getItem( localStorageName ) )
    ) ; // reading JSON data
  } // ReadStringsIntoTheList() PRIVATE

  /**
   * Generates an edit button for an item
   */
  function NewEditButton() {
    const btn = document.createElement("button") ;
    btn.className = "material-symbols-rounded" ;
    btn.name = "edit" ;
    btn.textContent = "edit_square" ;
    // btn1.textContent = "🖊️" ;
    
    return btn ;
  } // NewEditButton()
  
  /**
   * Generates an remove button for an item
  */
  function NewDeleteButton() {
    const btn = document.createElement("button") ;
    btn.className = "material-symbols-rounded" ;
    btn.name = "remove" ;
    btn.textContent = "delete" ;
    // btn2.textContent = "🗑️" ;

    return btn ;
  } // NewDeleteButton()

  /**
   * Generates a checkbox element
   */
  function NewCheckbox() {
    const chkbox = document.createElement("input") ;
    chkbox.type = "checkbox" ;
    chkbox.className = chkbox.name = "done" ; // as a checkbox

    const chkmark = document.createElement("span") ;
    chkmark.className = "checkmark" ;

    const chkbox_container = document.createElement("label") ;
    chkbox_container.className = "checkbox-container" ;
    chkbox_container.append( chkbox, chkmark ) ;
    return chkbox_container ;
  } // NewCheckbox()

  /**
   * Write all list items to the buffer.
   */
  function WriteAllItemsIntoTheList( batchSize = 500 ) {
    let n = 0 ;
    const buf = document.getElementById("buffer") ;

    function renderNextBatch() {
      const max = Math.min( n + batchSize, gList.length ) ;
      for ( ; n < max ; n++ ) {
        const objAttr = document.createElement("li") ;
        objAttr.draggable = true ;
        objAttr.className = "items" ; // To have the browser correctly autofilling the form

        const chkbox_container = NewCheckbox() ; // a checkbox

        // tag for item contents
        const tagElem = document.createElement("tag") ;
        tagElem.textContent = gList[n].contents ;

        const btn1 = NewEditButton() ;   // an 'edit' button
        const btn2 = NewDeleteButton() ; // a 'remove' button

        if ( gList[n].checked ) {// checkbox-container checkmark
          const chkboxStat = chkbox_container.getElementsByTagName("input")[0] ;
          chkboxStat.checked = true ;
          tagElem.style.textDecoration = "line-through" ;
          tagElem.style.opacity = 0.5 ;
        } // if: the item has been done
        else {
          tagElem.style.textDecoration = "none" ;
          tagElem.style.opacity = 1 ;
        } // else: the item is yet to be done

        objAttr.dataset.index = n ;
        objAttr.append( chkbox_container, tagElem, " ", btn1, btn2 ) ;
        buf.append( objAttr ) ;
      } // for: each item

      if ( n < gList.length ) setTimeout( renderNextBatch, 0 ) ;
    } // renderNextBatch(): process the next batch of data

    renderNextBatch() ;
  } // WriteAllItemsIntoTheList()

  /**
   * Sort all list items by a specific property;
   * 
   * the final result is in an ascending order.
   * @param mode order of the final result; may be `ascending` or `descending`
   */
  function SortItemsByContents(mode) {
    gList.sort( ( a, b ) => {
      const nameA = a.contents.toUpperCase() ;
      const nameB = b.contents.toUpperCase() ;
      if ( nameA < nameB ) return ( mode === ORDER.ASCENDING ) ? -1 : 1 ;
      if ( nameA > nameB ) return ( mode === ORDER.ASCENDING ) ? 1 : -1 ;

      // names must be equal
      return 0 ;
    }) ;
  } // SortItemsByContents()

  /**
   * Sort all list items by a specific property;
   * 
   * the final result is in an ascending order.
   * @param mode order of the final result; may be `ascending` or `descending`
   */
  function SortItemsByCheckStatus(mode) {
    if ( mode === ORDER.ASCENDING ) gList.sort( ( a, b ) => a.checked - b.checked ) ;
    else gList.sort( ( a, b ) => b.checked - a.checked ) ;
  } // SortItemsByCheckStatus()

  return {
    // The following methods are PUBLIC to global scope.
    /**
     * Inserts multiple items at once into the list array.
     * 
     * @param {...any} elem elements to insert into the list 
     */
    PushItemToList( ctnt, chked ) { gList.push( { contents: ctnt, checked: chked } ) ; },  // PUBLIC

    /**
     * Remove a specific number of items in the item list
     * @param {Integer} st the index where the deletion starts at
     * @param {Integer} count number of items to remove
     */
    RmvItemsFromList( st, count ) { gList.splice( st, count ) ; }, // PUBLIC

    /**
     * Remove a specific item in the item list
     * @param {Integer} st the index of the item where the deletion occurs
     */
    RmvItemFromList( st ) { gList.splice( st, 1 ) ; }, // PUBLIC

    /**
     * Change the contents of a specific item without affecting its check property.
     * 
     * @param {Integer} idx index where the editting item occurs; must not be smaller than zero
     * @param {String} ctnt item content to change to
     */
    EditItemCtnt( idx, ctnt ) { EditItemProperty( idx, ctnt, null ) ; }, // PUBLIC
    
    /**
     * Change the checking property of a specific item with its contents unchanged.
     * 
     * @param {Integer} idx index where the editting item occurs; must not be smaller than zero
     * @param {boolean} chk checked property to change to
    */
    EditItemChk( idx, chk )   { EditItemProperty( idx, null, chk ) ; }, // PUBLIC

    /**
     * Update indices of all items
     * 
     * @param {Number} batchSize items each batch to process. 500 by default 
     */
    async UpdateAllItemsIndices( batchSize = 100 ) {
      const t = Date.now() ;

      // list items are of static snapshot, NOT live!
      const cc = Array.from( document.getElementsByTagName("li") ) ;

      let i = 0 ;
      const listSize = cc.length ;
    
      function renderNextBatch() {
        const max = Math.min( i + batchSize, listSize ) ;

        // update all items' indices
        for ( ; i < max ; i++ )
          if ( cc[i] ) cc[i].dataset.index = i ;

        if ( i < listSize ) setTimeout( renderNextBatch, 0 ) ;
        else console.log( `All items reindicing: ${(Date.now()-t)/1000} seconds` ) ;
      } // renderNextBatch(): process the next batch of data

      renderNextBatch() ;
    }, // PUBLIC

    /**
     * Move items in the list buffer.
     */
    MoveItemInsideTheList() {
      if ( this.ItemDraggedToDifIdx() ) MoveItem( initIdx, finIdx ) ;
      finIdx = initIdx = null ;

      gLM.UpdateAllItemsIndices() ;
    }, // PUBLIC

    /**
     * Saves list of items to the key `LocalStorage` pointing at.
     * 
     * Different browsers, users, desktop numbers result in
     * DIFFERENT storages.
     */
    SaveList() {
      // Latest code: save it as an array of JSON items
      localStorage.setItem( localStorageName, JSON.stringify(gList) ) ;
    }, // PUBLIC

    /**
     * Remove all items in the item list without affecting the one stored in `localStorage`
     */
    DeleteList() {
      ClearBuffer() ;
      ClearList() ;
    }, // PUBLIC

    /**
     * Overwrite the old list with a new one
     * once loaded from `localStorage`.
     * 
     * @param {{contents:String, checked:boolean}} newList a JSON list to be overweitten on the old list
     */
    OverwriteWithNewList( newList ) {
      // Clear all items in the list buffer
      this.DeleteList() ;

      // Then write the new one to the list
      gList.push.apply( gList, newList ) ;

      WriteAllItemsIntoTheList(); // Finally, write all items to the buffer
    }, // PUBLIC

    /**
     * Check the dragged item's final status.
     * @returns if the item has been dragged to a different location
     */
    ItemDraggedToDifIdx() { return finIdx !== initIdx ; },

    //// FUNC3: CREATE A LIST OF WORD STRINGS ON THE LIST BUFFER
    CreateList() {
      if ( document.getElementById( "buffer" ).textContent !== "" ) {
        this.DeleteList() ;
      } // if the list buffer has at least one item

      ReadStringsIntoTheList() ; // READ THE LOCAL FILE
      WriteAllItemsIntoTheList() ; // THEN WRITE IT TO THE LIST
    }, // CreateList()

    /**
     * Sort all list items by a specific property;
     * 
     * the final result is in an ascending order.
     * @param prop property which the item list buffer is sorted by. `CONTENTS` or `CHECKBOX_STATUS` only
     * @param mode The order of sorting result. May be `ascending` or `descending` only
     */
    SortListItems( prop, mode ) {
      ClearBuffer() ;

      if ( prop === ITEM_PROPERTY.CONTENTS ) {
        SortItemsByContents(mode) ;
      } // if: sort by item contents
      else if ( prop === ITEM_PROPERTY.CHECKBOX_STATUS ) {
        SortItemsByContents( ORDER.ASCENDING ) ;
        SortItemsByCheckStatus(mode) ;
      } // else if: sort by checkbox status
      else
        throw Error(
          `Property must be CONTENTS or CHECKBOX_STATUS,
           we instead received ${mode}`
        ) ;

      WriteAllItemsIntoTheList() ;
    }, // SortListItemsASC(): via quicksort for efficiency

    /**
     * Generates a pop-up message using Sweetalert2
     * @param {String} type type of pop-up message; must be `error`, `warning`, `success` or `info`
     * @param {String} msg message contents
     */
    PopUpMsg( type, msg ) {
      type = type.trim().toLowerCase() ;
      try {
        // Allow nothing except the following types:
        // error, warning, success, info
        if ( ! [ "error","warning","success","info" ].includes(type) )
          throw `Type must be one of the following:\nerror, warning, success, info,\nInstead receiving an invalid type: ${type}` ;

        const typeName = type.slice(0, 1).toUpperCase().concat( type.slice(1, type.length) ) ;
        if ( navigator.onLine ) {
          swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            title: typeName,
            text: msg, 
            icon: type,
          }) ;
        } // if connected to internet
        else {
          alert( `${typeName}:\n${msg}` ) ;
        } // else: not connected to internet
      } catch (err) {
        console.error( err ) ;
      }
    }, // PopUpMsg()

    /**
     * Adding an item to the to-do list
     */
    AddItem() {
      const val = document.getElementById( "inputItem" ).value ;
      const objAttr = document.createElement("li") ;
      const buf = document.getElementById( "buffer" ) ;

      objAttr.draggable = true ;
      objAttr.className = "items" ; // To have the browser correctly autofilling the form

      const chkbox_container = NewCheckbox() ; // a checkbox

      // tag for item contents
      const tagElem = document.createElement("tag") ;
      tagElem.textContent = val ;

      const btn1 = NewEditButton() ;   // as an edit button
      const btn2 = NewDeleteButton() ; // as a delete button

      objAttr.dataset.index = buf.children.length ;
      objAttr.append( chkbox_container, tagElem, " ", btn1, btn2 ) ;

      buf.appendChild( objAttr ) ;
      gLM.PushItemToList( val, false ) ; // New item default: not checked
    },

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
