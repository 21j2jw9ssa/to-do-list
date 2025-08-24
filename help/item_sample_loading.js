const chkbox = document.querySelector(".done") ;

chkbox.addEventListener( "click", function() {
  const listItem = chkbox.parentElement.parentElement ;
  const tagElem = listItem.querySelector(".tag") ;

  if ( chkbox.checked ) {
    tagElem.style.textDecoration = "line-through" ;
    tagElem.style.opacity = 0.5 ;
  } // if: the item has been done
  else {
    tagElem.style.textDecoration = "none" ;
    tagElem.style.opacity = 1 ;
  } // else: the item is yet to be done
}) ;