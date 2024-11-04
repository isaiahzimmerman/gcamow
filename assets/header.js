document.addEventListener("DOMContentLoaded", function() {
  // Code to run when the DOM is fully loaded
  includeHTML();  // Make sure HTML is included first
  pollDOM();  // Then start polling for the header elements
  runOnLoad();  // Any other initialization code
});

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          elmnt.removeAttribute("w3-include-html");
          includeHTML();  // Ensure recursive call to include nested HTML
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  }
}

function pollDOM() {
  const el = document.getElementById('header_container');
  const el2 = document.getElementById('header_back_button');
  if (el != null && el2 == null) {
    header_draw_back();
  } else {
    setTimeout(pollDOM, 300);  // Keep polling if not found yet
  }
}

function header_draw_back(){
  if(window.location.pathname.split('/').length > 3){
    document.getElementById('header_container').innerHTML+=
    `
    <div class="header_element">
      <a href="../" id="header_back_button">Back</a>
    </div>
    `
  }
}

function header_reveal_menu(){
  // document.getElementById("header_container").style.top = "0"
  // document.getElementById("header_container").style.opacity = 1
  showMobileNavList()
  document.body.classList.add("noScroll")
  document.getElementById("header_reveal_button").setAttribute("onclick", "header_hide_menu()")
  for(i=1;i<=3;i++){
    document.getElementById(`header_menu_line${i}`).innerHTML = `<div></div>`
  }
}

function header_hide_menu(){
  // document.getElementById("header_container").style.top = "calc(var(--header-scale)*-6)"
  // document.getElementById("header_container").style.opacity = 0
  hideMobileNavList()
  document.body.classList.remove("noScroll")
  try {
    document.getElementById("header_reveal_button").setAttribute("onclick", "header_reveal_menu()")
    for(i=1;i<=3;i++){
      document.getElementById(`header_menu_line${i}`).innerHTML = ``
    }
  } catch (error) {
    
  }
}

// function header_draw_additional_button(text, action){
//   clickAction = ""
//   if(action.type == "href"){
//     clickAction = `href="${action.href}"`
//   }else if(action.type == "onclick"){
//     clickAction = `onclick="${action.onclick}"`
//   }

//   document.getElementById('header_container').innerHTML+=
//     `<div class="header_element">
//       <a ${clickAction}>${text}</a>
//     </div>`
// }

function replaceAddressBar(url) {
  history.pushState(null, '', url);
}

function siteWarningExpired(){
  today = new Date()
  expireDate = new Date(updates.expires.year, updates.expires.month-1, updates.expires.day, updates.expires.hour, updates.expires.minute)

  return expireDate.getTime() < today.getTime()
}

function hideSiteWarning(){
  document.getElementById("siteWarningContainer").style.display = "none"
  document.getElementById("showSiteWarning").style.display = "flex"
}

function showSiteWarning(){
  document.getElementById("siteWarningContainer").style.display = "flex"
  document.getElementById("showSiteWarning").style.display = "none"
}


function runOnLoad(){
  // Get the full URL of the current page
  const queryString = window.location.search; // ?userID=123&token=abc

  // Create a URLSearchParams object
  const urlParams = new URLSearchParams(queryString);

  // Access individual parameters
  const scrollID = urlParams.get('scrollTo');
  
  console.log(queryString,urlParams,scrollID)
  if(scrollID){
    setTimeout(() => {
      goToSite(scrollID)
    }, 200);
    //TODO: JANK SOLUTION
  }

  replaceAddressBar(window.location.pathname)

  const resizeEvent = new Event('resize');

  // Dispatch the event to the window
  window.dispatchEvent(resizeEvent);

  setTimeout(() => {
    noRedirectA()
  }, 400);

  footerElement = document.getElementById("footer_current_year")
  while(!footerElement){
    setTimeout(() => {
      footerElement = document.getElementById("footer_current_year")
    }, 100);
  }
  footerElement.innerHTML = new Date().getFullYear()

  siteWarning = document.getElementById("siteWarning")
  siteWarningContainer = document.getElementById("siteWarningContainer")
  while(!siteWarning){
    setTimeout(() => {
      siteWarning = document.getElementById("siteWarning")
      siteWarningContainer = document.getElementById("siteWarningContainer")

    }, 100);
  }
  if(!siteWarningExpired()){
    siteWarning.innerHTML = updates.message
    siteWarningContainer.style.display = "flex"
  }
}

function noRedirectA(){
  const links = document.querySelectorAll('a:not(.hrefOn)');
  console.log(links)
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default link behavior
    });
  });
}


function hideMobileNavList(){
  try {
    document.getElementById("mobile_nav_list").style.display = "none"
  } catch (error) {
    
  }
}

function showMobileNavList(){
  //TODO: change this?
  document.getElementById("mobile_nav_list").style.display = "flex"
}

function getCurrentSite(){
  sitePath = window.location.pathname.split("/")
  currentSite = sitePath[sitePath.length-2]
  if(currentSite == ""){currentSite="home"}
  return currentSite
}

function goToSite(id){
  header_hide_menu()
  links = [
    'home', 'volunteer', 'payment'
  ]
  sites = {
    home: ['about', 'contact', 'donate', 'home'],
    volunteer: ['volunteer'],
    payment: ['payment'],
  }

  if(sites[getCurrentSite()].indexOf(id) >= 0){
    scrollSite(id)
    //TODO: undefined
    console.log(window.location.pathname)
  }else{
    siteToLink = ""
    links.forEach(element => {
      if(sites[element].indexOf(id) >= 0){
        siteToLink = `/${element}`
        if(siteToLink == "/home"){siteToLink = "/"}
      }
    });
    if(id != "volunteer" && id != "payment"){
      window.location.href = siteToLink+"?scrollTo="+id;
    }
    else{
      window.location.href = siteToLink
    }
  }
}

function getSiteType(){
  if(document.body.classList.contains("mobile")){
    return "mobile"
  }
  if(document.body.classList.contains("desktop")){
    return "desktop"
  }
  console.error("site type is undefined?")
}

function scrollSite(id){
  element = document.getElementById(id)

  if(!element){
    console.error(element)
    return
  }

  if(document.getElementById("desktop_nav_spacing")){
    navBarHeight = document.getElementById("desktop_nav_spacing").getBoundingClientRect().height
  }
  else{
    console.log(id)
    return
  }

  if(getSiteType() == "mobile"){
    navBarHeight = document.getElementById("mobile_nav_spacing").getBoundingClientRect().height
  }

  const y = element.getBoundingClientRect().top + window.scrollY - navBarHeight;

  window.scroll({
    top: y,
    behavior: 'smooth'
  });
}

window.addEventListener('resize', function() {
  // Code to run on window resize
  // console.log('Window resized. New dimensions: ', window.innerWidth, window.innerHeight);
  if(this.window.innerWidth <= 700){
    changeExperience("mobile")
  }else{
    changeExperience("desktop")
  }
});

function changeExperience(type){
  if(type=="desktop"){
    if(document.body.classList.contains("mobile")){
      document.body.classList.remove("mobile")
      document.body.classList.add("desktop")
    }
    header_hide_menu()
  }
  else if(type=="mobile"){
    if(document.body.classList.contains("desktop")){
      document.body.classList.remove("desktop")
      document.body.classList.add("mobile")
    }
  }else{
    console.error("reached (what should be) unreachable code")
  }
}