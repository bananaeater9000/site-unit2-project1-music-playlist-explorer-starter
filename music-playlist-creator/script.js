// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("modal-overlay");
const closeButton = document.getElementsByClassName("close-button")[0];

// Function to open modal with playlist details
function openModal(playlist) {
    document.querySelector('.modal-playlist-title').innerText = playlist.title;
    document.querySelector('.modal-playlist-image').src = playlist.imageUrl;
    document.querySelector('.modal-creator-name').innerText = playlist.creator;

    modal.style.display = "flex";
}

// Close modal when close button is clicked
closeButton.onclick = function() {
    modal.style.display = "none";
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
