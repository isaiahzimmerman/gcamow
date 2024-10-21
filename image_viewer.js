imageNames = ["00.jpg", "01.jpg", "02.jpg"]
currentImageIndex = 0

function imageViewerScroll(dir){
    delta = 0
    if(dir=="left"){delta=-1}
    else if(dir=="right"){delta=1}
    else{console.error('invalid direction!')}

    currentImageIndex = (currentImageIndex + delta + imageNames.length) % imageNames.length

    document.getElementById("image_viewer_image_img").src = "/assets/promotional_images/"+imageNames[currentImageIndex]
}

function showImageViewer(){
    document.getElementById("image_viewer").style.display = "flex"
    document.getElementById("image_viewer_bg").style.display = "flex"
}

function hideImageViewer(){
    document.getElementById("image_viewer_bg").style.display = "none"
    document.getElementById("image_viewer").style.display = "none"
    document.getElementById("about_image").src = "/assets/promotional_images/"+imageNames[currentImageIndex]
}