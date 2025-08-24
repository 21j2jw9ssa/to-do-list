const items = document.getElementsByClassName( "tag" ) ;  //// "tag" items
const dropdown = document.querySelector( ".dropdown" ) ;
const toggle = dropdown.querySelector( ".dropdown-toggle" ) ;
const menu = dropdown.querySelector( ".dropdown-menu" ) ;

const dropdownList = document.getElementById( "dropdown-list" ) ;

// Function to enable dropdown
function enableDropdown() {
  dropdown.classList.remove("disabled") ;
  toggle.classList.remove("disabled") ;

  // style
  toggle.style.backgroundColor = "#ffcf3f" ;
  toggle.style.color = "black" ;
  toggle.style.cursor = "pointer" ;

  toggle.title = "sort items" ; 
} // enableDropdown()

// Function to disable dropdown
function disableDropdown() {
  dropdown.classList.add("disabled") ;
  toggle.classList.add("disabled") ;
  toggle.textContent = "👇 choose a sorting" ;

  // style
  toggle.style.backgroundColor = "#ffdf7f" ;
  toggle.style.color = "gray" ;
  toggle.style.cursor = "not-allowed" ;

  toggle.title = "sort items (not available with an empty list)" ; 
} // disableDropdown()

toggle.addEventListener( "click", () => {
  // Check for disabled class
  if ( dropdown.classList.contains("disabled") ) return ;

  const expanded = toggle.getAttribute("aria-expanded") === "true" || false;
  toggle.setAttribute("aria-expanded", !expanded);
  menu.style.display = expanded ? "none" : "block";
});

menu.querySelectorAll("li").forEach( item => {
  item.addEventListener( "click", () => {
    toggle.textContent = item.textContent; // set button text to selected option
    toggle.dataset.mode = item.dataset.mode ;
    menu.style.display = "none";
    toggle.setAttribute("aria-expanded", "false") ;
  });
});

/* Close when clicking outside */
document.addEventListener( "click", (e) => {
  if ( !dropdown.contains(e.target) ) {
    menu.style.display = "none";
    toggle.setAttribute("aria-expanded", "false");
  }
});