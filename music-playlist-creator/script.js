//s for opening and closing the modal
const modal = document.getElementById("modal-overlay");
const closeButton = document.getElementsByClassName("close-button")[0];

// Store current playlist and original song order
let currentPlaylist = null;
let originalSongOrder = null;
let isShuffled = false;

//function to open modal with playlist details
function openModal(playlist) {
    // Store current playlist and original order
    currentPlaylist = playlist;
    originalSongOrder = [...playlist.songs];
    isShuffled = false;

    // Update modal header with playlist information
    document.querySelector('.modal-playlist-title').innerText = playlist.title;
    document.querySelector('.modal-playlist-image').src = playlist.imageUrl;
    document.querySelector('.modal-creator-name').innerText = playlist.creator;

    // Reset shuffle button state
    const shuffleButton = document.querySelector('.shuffle-button');
    shuffleButton.classList.remove('shuffled');
    shuffleButton.innerText = 'Shuffle';

    // Display songs
    displaySongs(playlist.songs);

    modal.style.display = "flex";
}

// Helper function to display songs in the modal
function displaySongs(songs) {
    const songListContainer = document.querySelector('.song-list');
    songListContainer.innerHTML = '';

    // Check if playlist has songs
    if (!songs || songs.length === 0) {
        songListContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #3a4042;">No songs in this playlist</p>';
    } else {
        // Create song items dynamically
        songs.forEach(function(song) {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';

            songItem.innerHTML = `
                <img class="song-image" src="${song.imageUrl}" alt="${song.title} cover">
                <div class="song-info">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-album">${song.album}</p>
                </div>
                <span class="song-duration">${song.duration}</span>
            `;

            songListContainer.appendChild(songItem);
        });
    }
}

//close modal when close button is clicked
closeButton.onclick = function() {
    modal.style.display = "none";
}

//close modal when click outside the modal content
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Add shuffle button event listener
document.querySelector('.shuffle-button').onclick = function() {
    toggleShuffle();
}

// Like button functionality
function toggleLike(event, button) {
    event.stopPropagation();

    const songCountSpan = button.nextElementSibling;
    let currentCount = parseInt(songCountSpan.innerText);

    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        button.innerText = '♡';
        songCountSpan.innerText = currentCount - 1;
    } else {
        button.classList.add('liked');
        button.innerText = '♥';
        songCountSpan.innerText = currentCount + 1;
    }
}

// Shuffle songs function
function shuffleSongs(songs) {
    // Create a copy of the array to avoid modifying original
    const shuffled = [...songs];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Toggle shuffle functionality
function toggleShuffle() {
    const shuffleButton = document.querySelector('.shuffle-button');

    if (isShuffled) {
        // Unshuffle - restore original order
        displaySongs(originalSongOrder);
        shuffleButton.classList.remove('shuffled');
        shuffleButton.innerText = 'Shuffle';
        isShuffled = false;
    } else {
        // Shuffle - create new random order each time
        const shuffled = shuffleSongs(originalSongOrder);
        displaySongs(shuffled);
        shuffleButton.classList.add('shuffled');
        shuffleButton.innerText = 'Unshuffle';
        isShuffled = true;
    }
}

// Load playlist data and create cards
function createPlaylistCards(playlists) {
    const container = document.querySelector('.playlist-cards');

    // Clear existing content
    container.innerHTML = '';

    // Check if playlists array is empty
    if (!playlists || playlists.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem; color: #3a4042;">No playlists found</p>';
        return;
    }

    // Iterate over playlists and create a card for each
    playlists.forEach(function(playlist) {
        // Create card element
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.onclick = function() {
            openModal(playlist);
        };

        // Create card content
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${playlist.imageUrl}" alt="${playlist.title} cover">
            </div>
            <div class="card-content">
                <h3 class="playlist-title">${playlist.title}</h3>
                <p class="creator-name">${playlist.creator}</p>
                <div class="card-footer">
                    <button class="like-button" onclick="toggleLike(event, this)">♡</button>
                    <span class="song-count">${playlist.songs.length}</span>
                </div>
            </div>
        `;

        // Append to container
        container.appendChild(card);
    });
}

// Load data from JSON file
fetch('data/data.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        createPlaylistCards(data);
    })
    .catch(function(error) {
        console.error('Error loading playlist data:', error);
        document.querySelector('.playlist-cards').innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem; color: #3a4042;">Error loading playlists</p>';
    });
