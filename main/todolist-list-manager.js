"use strict"

const ORDER = {
  ASCENDING: "GOING UP!",
  DESCENDING: "GOING DOWNNN!",
}

const ITEM_PROPERTY = {
  CONTENTS: "property_contents",
  CHECKBOX_STATUS: "property_checkbox status",
} ;

Object.freeze( ORDER, ITEM_PROPERTY ) ;

/**
 * Global list manager
 */
const gLM = ( function() {
  /*
  The following properties and methods,
  unless specified, are private and must be called
  via public methods.
  */

  /**
   * The key where the `localStorage` interface points at
   * 
   * By default, it uses 'listFile' as the name for `localStorage` function
   * 
   * @type `String` name where localStorage stores data at
   */
  const localStorageName = "listFile" ;

  /**
   * The array to store list items
   * 
   * Each JSON tuple `{contents: String, checked: boolean}` represents an item in the list.
   * 
   * @type_1 `String` the item's contents
   * @type_2 `boolean` if the item is checked or not
   */
  const gList = [] ;

  /**
   * @type `Integer` index of a specific item before being dragged
   */
  let initIdx = null ;

  /**
   * @type `Integer` index of a specific item after being dragged
   */
  let finIdx = null ;

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
  }

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
  }

  /**
   * Remove all items in the item list
   * without affecting the one stored in `localStorage`
   */
  function ClearList() { gList.splice( 0, gList.length ) ; }

  /**
   * Remove all items in the list (buffer)
   * 
   * @param {Number} batchSize items each batch to process. 500 by default 
   */
  async function ClearBuffer( batchSize = 500 ) {
    try {
      const buf = document.getElementById("buffer") ;
      const items = buf.getElementsByTagName("li") ;

      let n = gList.length - 1 ;

      async function renderNextBatch() {
        const max = Math.max( n - batchSize + 1, 0 ) ;
        for ( ; n >= max ; n-- ) {
          const tagElem = items[n] ;
          if ( tagElem ) {
            tagElem.remove() ; // Remove the parent element from the DOM
          } // if managed to get the list item
        } // for: each item

        if ( n > 0 ) await renderNextBatch() ;
      } // renderNextBatch(): process the next batch of data

      await renderNextBatch() ;
    } catch {
      console.error( "Opps! Couldn't clear list buffer" ) ;
    }
  } // ClearBuffer()

  /**
   * Generates a drag indicator for an item
   */
  function NewDragIndicator() {
    const drag = document.createElement("div") ;

    if ( navigator.onLine ) {
      drag.className = "material-symbols-rounded" ;
      drag.textContent = "drag_indicator" ;
    } else {
      drag.className = "offline-emoji-labelled" ;
      drag.textContent = "⛓" ;
    }

    drag.dataset.typeName = "drag" ;

    return drag ;
  } // NewDragIndicator()

  /**
   * Generates an edit button for an item
   */
  function NewEditButton() {
    let btn ;

    if ( navigator.onLine ) {
      btn = document.createElement("div") ;
      btn.className = "material-symbols-rounded" ;
      btn.textContent = "edit_square" ;
    } else {
      btn = document.createElement("button") ;
      btn.className = "offline-emoji-labelled" ;
      btn.textContent = "🖊️" ;
    }

    btn.dataset.typeName = "edit" ;

    return btn ;
  } // NewEditButton()

  /**
   * Generates an remove button for an item
  */
  function NewDeleteButton() {
    let btn ;

    if ( navigator.onLine ) {
      btn = document.createElement("div") ;
      btn.className = "material-symbols-rounded" ;
      btn.textContent = "delete" ;
    } else {
      btn = document.createElement("button") ;
      btn.className = "offline-emoji-labelled" ;
      btn.textContent = "🗑️" ;
    }

    btn.dataset.typeName = "remove" ;

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
   * 
   * @param {Number} batchSize items each batch to process. 500 by default 
   */
  async function WriteAllItemsIntoTheList( batchSize = 500 ) {
    let n = 0 ;
    const buf = document.getElementById("buffer") ;

    async function renderNextBatch() {
      const max = Math.min( n + batchSize, gList.length ) ;
      for ( ; n < max ; n++ ) {
        const objAttr = document.createElement("li") ;
        objAttr.draggable = false ;
        objAttr.className = "items" ; // To have the browser correctly autofilling the form

        const chkbox_container = NewCheckbox() ; // a checkbox

        // tag for item contents
        const tagElem = document.createElement("span") ;
        tagElem.className = "tag" ;
        tagElem.textContent = gList[n].contents ;

        const drag = NewDragIndicator() ;   // as a drag indicator
        const btnEdit = NewEditButton() ;   // as an 'edit' button
        const btnDel = NewDeleteButton() ;  // as a 'remove' button

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

        const upCtnt = document.createElement("div") ;
        upCtnt.className = "upper-content" ;
        const lowCtnt = document.createElement("div") ;
        lowCtnt.className = "lower-content" ;
        const rightCtnt = document.createElement("div") ;
        rightCtnt.className = "content" ;

        upCtnt.append( chkbox_container, tagElem ) ;
        lowCtnt.append( btnEdit, btnDel ) ;
        rightCtnt.append( upCtnt, lowCtnt ) ;
        objAttr.append( drag, rightCtnt ) ;
        buf.append( objAttr ) ;
      } // for: each item

      if ( n < gList.length ) await renderNextBatch() ;
    } // renderNextBatch(): process the next batch of data

    await renderNextBatch() ;
  } // WriteAllItemsIntoTheList()

  /**
   * Sort all list items by a specific property;
   * 
   * the final result is in an ascending order.
   * @param mode order of the final result; may be `ascending` or `descending`
   */
  function SortItemsByContents(mode) {
    gList.sort( ( a, b ) => {
      const nameA = a.contents ;
      const nameB = b.contents ;
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

  /**
   * Sort all list items by a specific property;
   * 
   * the final result is in an ascending order.
   * @param prop property which the item list buffer is sorted by. `CONTENTS` or `CHECKBOX_STATUS` only
   * @param mode The order of sorting result. May be `ascending` or `descending` only
   */
  async function SortListItems( prop, mode ) {
    await ClearBuffer() ;

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

    await WriteAllItemsIntoTheList() ;
  } // SortListItems()

  return {
    // The following methods are PUBLIC to global scope.

    /**
     * Inserts multiple items at once into the list array.
     * 
     * @param {String} ctnt item content 
     * @param {Boolean} chked checkbox status
     */
    PushItemToList( ctnt, chked ) { gList.push( { contents: ctnt, checked: chked } ) ; },

    /**
     * Remove a specific number of items in the item list
     * @param {Integer} st the index where the deletion starts at
     * @param {Integer} count number of items to remove
     */
    RmvItemsFromList( st, count ) { gList.splice( st, count ) ; },

    /**
     * Remove a specific item in the item list
     * @param {Integer} st the index of the item where the deletion occurs
     */
    RmvItemFromList( st ) { gList.splice( st, 1 ) ; },

    /**
     * Change the contents of a specific item without affecting its check property.
     * 
     * @param {Integer} idx index where the editting item occurs; must not be smaller than zero
     * @param {String} ctnt item content to change to
     */
    EditItemCtnt( idx, ctnt ) { EditItemProperty( idx, ctnt, null ) ; },
    
    /**
     * Change the checking property of a specific item with its contents unchanged.
     * 
     * @param {Integer} idx index where the editting item occurs; must not be smaller than zero
     * @param {boolean} chk checked property to change to
    */
    EditItemChk( idx, chk )   { EditItemProperty( idx, null, chk ) ; },

    /**
     * Update indices of all items
     * 
     * @param {Number} batchSize items each batch to process. 500 by default 
     */
    async UpdateAllItemsIndices( batchSize = 500 ) {
      const t = Date.now() ;

      // list items are of static snapshot, NOT live!
      const buf = document.getElementById("buffer") ;
      const cc = buf.getElementsByTagName("li") ;

      let i = 0 ;
      const listSize = cc.length ;
    
      async function renderNextBatch() {
        const max = Math.min( i + batchSize, listSize ) ;

        // update all items' indices
        for ( ; i < max ; i++ )
          if ( cc[i] ) cc[i].dataset.index = i ;

        if ( i < listSize ) await renderNextBatch() ;
        else console.log( `All items reindicing: ${(Date.now()-t)/1000} seconds` ) ;
      } // renderNextBatch(): process the next batch of data

      await renderNextBatch() ;
    }, // UpdateAllItemsIndices()

    /**
     * Move items in the list buffer.
     */
    async MoveItemInsideTheList() {
      if ( this.ItemDraggedToDifIdx() ) MoveItem( initIdx, finIdx ) ;
      finIdx = initIdx = null ;
  
      await gLM.UpdateAllItemsIndices() ;
    }, // MoveItemInsideTheList()

    /**
     * Overwrite the old list with a new one
     * once loaded from `localStorage`.
     * 
     * @param {{contents:String, checked:boolean}[]} newList a JSON list to be overweitten on the old list
     */
    async OverwriteWithNewList( newList ) {
      try {
        await ClearBuffer() ;
        ClearList() ;

        // Then write the new one to the list
        gList.push.apply( gList, newList ) ;

        await WriteAllItemsIntoTheList() ; // Finally, write all items to the buffer
      } catch (err) {
        console.error( "Error: couldn't overwrite list" ) ;
      }
    }, // OverwriteWithNewList()

    /**
     * Check the dragged item's final status.
     * @returns if the item has been dragged to a different location
     */
    ItemDraggedToDifIdx() { return finIdx !== initIdx ; },

    /**
     * Generates a pop-up message using Sweetalert2
     * @param {String} type type of pop-up message; must be `error`, `warning`, `success` or `info`
     * @param {String} msg message contents
     * @param {Boolean} msgIsHTML if message contents is HTML
     */
    PopUpMsg( type, msg, msgIsHTML = false ) {
      type = type.trim().toLowerCase() ;
      try {
        // Allow nothing except the following types:
        // error, warning, success, info
        if ( ! [ "error","warning","success","info" ].includes(type) )
          throw `Type must be one of the following:\nerror, warning, success, info,\nInstead receiving an invalid type: ${type}` ;

        const typeName = type.slice(0, 1).toUpperCase().concat( type.slice(1, type.length) ) ;
        if ( msgIsHTML ) {
          swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            title: typeName,
            html: DOMPurify.sanitize(msg), // sanitize HTML contents to prevent XSS attacks
            icon: type,
          }) ;
        } else {
          swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            title: typeName,
            text: msg, 
            icon: type,
          }) ;
        }
      } catch (err) {
        console.error( err ) ;
      }
    }, // PopUpMsg()




    ////////////////////////////////////////////
    //////// FUNCTIONS FOR EXTERNAL USE ////////
    ////////////////////////////////////////////

    /**
     * Adds an item to the to-do list
     */
    AddItem() {
      const val = document.getElementById( "inputItem" ).value ;
      const objAttr = document.createElement("li") ;
      const buf = document.getElementById( "buffer" ) ;

      objAttr.draggable = false ;
      objAttr.className = "items" ; // To have the browser correctly autofilling the form

      const chkbox_container = NewCheckbox() ; // a checkbox

      // tag for item contents
      const tagElem = document.createElement("span") ;
      tagElem.className = "tag" ;
      tagElem.textContent = val ;

      const drag = NewDragIndicator() ;   // as a drag indicator
      const btnEdit = NewEditButton() ;   // as an 'edit' button
      const btnDel = NewDeleteButton() ;  // as a 'remove' button

      objAttr.dataset.index = buf.children.length ;

      const upCtnt = document.createElement("div") ;
      upCtnt.className = "upper-content" ;
      const lowCtnt = document.createElement("div") ;
      lowCtnt.className = "lower-content" ;
      const rightCtnt = document.createElement("div") ;
      rightCtnt.className = "content" ;

      upCtnt.append( chkbox_container, tagElem ) ;
      lowCtnt.append( btnEdit, btnDel ) ;
      rightCtnt.append( upCtnt, lowCtnt ) ;
      objAttr.append( drag, rightCtnt ) ;
      buf.appendChild( objAttr ) ;

      gLM.PushItemToList( val, false ) ; // New item default: not checked
    }, // AddItem()

    /**
     * Saves list of items to the key `LocalStorage` pointing at.
     * 
     * Different browsers, users, desktop numbers result in
     * DIFFERENT storages.
     */
    SaveList() {
      // Latest code: save it as an array of JSON items
      localStorage.setItem( localStorageName, JSON.stringify(gList) ) ;
    }, // SaveList()

    /**
     * Clear `localStorage` file where a list is stored
     */
    DeleteList() {
      localStorage.removeItem( localStorageName );
    },

    /**
     * Sort all items in the list buffer
     */
    async SortItems() {
      const sortMode = toggle.dataset.mode ;
      if ( sortMode === "magnitude-asc" )
        await SortListItems( ITEM_PROPERTY.CONTENTS, ORDER.ASCENDING ) ;
      else if ( sortMode === "magnitude-desc" )
        await SortListItems( ITEM_PROPERTY.CONTENTS, ORDER.DESCENDING ) ;
      else if ( sortMode === "checkbox-status-asc"  )
        await SortListItems( ITEM_PROPERTY.CHECKBOX_STATUS, ORDER.ASCENDING ) ;
      else if ( sortMode === "checkbox-status-desc" )
        await SortListItems( ITEM_PROPERTY.CHECKBOX_STATUS, ORDER.DESCENDING ) ;
    },

    /**
     * Remove all items in the item list without affecting the one stored in `localStorage`
     */
    async ClearListBuffer() {
      await ClearBuffer() ; // clear the list buffer
      ClearList() ;
    }, // PUBLIC

    /**
     * Recovers the list upon opening the To-do List page
     */
    async LoadListLastState() {
      if ( localStorage.getItem( localStorageName ) ) {
        gList.push.apply( gList,
          JSON.parse( localStorage.getItem( localStorageName ) )
        ) ; // reading JSON data

        await WriteAllItemsIntoTheList() ; // THEN WRITE IT TO THE LIST
      } // if there is at least one item in the list
    }, // LoadListLastState()

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

    GetFinIdx() { return finIdx ; },

    GetListSize() { return gList.length ; },

    GetLocalStorageStat() { return localStorage.getItem( localStorageName ) ; },

    //////////////////////////////////////////////
    //////// BASIC APPLICATION OPERATIONS ////////
    //////////////////////////////////////////////

  } // return: public members and methods 
})() ; // gLM singleton