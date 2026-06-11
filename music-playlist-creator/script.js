//s for opening and closing the modal
const modal = document.getElementById("modal-overlay");
const closeButton = document.getElementsByClassName("close-button")[0];

// Store current playlist and original song order
let currentPlaylist = null;
let originalSongOrder = null;
let isShuffled = false;

// Store all playlists data
let allPlaylists = [];
let filteredPlaylists = [];
let editingPlaylistId = null;
let nextPlaylistId = 1;
let nextSongId = 1;

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Load dark mode preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

// API Key - OpenRouter API
const API_KEY = 'YOUR_API_KEY_HERE';

// AI prompt constants
const SYSTEM_PROMPT = 'You are a music curator who understands playlist vibes and themes. Generate a 2-3 sentence description that captures the mood and genre without listing individual songs. Avoid generic marketing language.';
const FAILURE_MESSAGE = 'Description unavailable';

//function to open modal with playlist details
function openModal(playlist) {
    // Store current playlist and original order
    currentPlaylist = playlist;
    originalSongOrder = [...playlist.songs];
    isShuffled = false;

    // Update modal header with playlist information
    document.querySelector('.modal-playlist-title').innerText = playlist.title;
    const modalImage = document.querySelector('.modal-playlist-image');
    modalImage.src = playlist.imageUrl;
    modalImage.onerror = function() {
        this.onerror = null;
        this.src = playlist.picsumFallback;
    };
    document.querySelector('.modal-creator-name').innerText = playlist.creator;

    // Reset shuffle button state and set up event listener
    const shuffleBtn = document.querySelector('.shuffle-button');
    shuffleBtn.classList.remove('shuffled');
    shuffleBtn.innerText = 'Shuffle';
    shuffleBtn.onclick = function() {
        toggleShuffle();
    };

    // Reset AI description and set up event listener
    const descriptionText = document.querySelector('.ai-description-text');
    descriptionText.innerText = '';
    const descriptionBtn = document.querySelector('.get-description-button');
    descriptionBtn.disabled = false;
    descriptionBtn.innerText = 'Get AI Description';
    descriptionBtn.onclick = function() {
        handleGetDescription();
    };

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
                <img class="song-image" src="${song.imageUrl}"
                     onerror="this.onerror=null; this.src='${song.picsumFallback}';"
                     alt="${song.title} cover">
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

// Event listeners will be set up when modal opens

// Like button functionality
function toggleLike(event, button, playlistId) {
    event.stopPropagation();

    const songCountSpan = button.nextElementSibling;
    let currentCount = parseInt(songCountSpan.innerText);

    // Find the playlist in allPlaylists
    const playlist = allPlaylists.find(p => p.id === playlistId);

    if (!playlist) return;

    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        button.innerText = '♡';
        currentCount = currentCount - 1;
        songCountSpan.innerText = currentCount;

        // Update playlist likes and state
        playlist.likes = currentCount;
        playlist.isLiked = false;
    } else {
        button.classList.add('liked');
        button.innerText = '♥';
        currentCount = currentCount + 1;
        songCountSpan.innerText = currentCount;

        // Update playlist likes and state
        playlist.likes = currentCount;
        playlist.isLiked = true;
    }

    // Check if we're currently sorting by likes
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.value === 'likes') {
        // Re-sort and re-display with animation
        setTimeout(function() {
            filterAndDisplayPlaylists();
        }, 300);
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

// Get AI playlist description
async function getPlaylistDescription(playlist) {
    try {
        // Build song list for prompt
        const songList = playlist.songs.map(function(song) {
            return song.title + ' by ' + song.artist;
        }).join(', ');

        // Construct user prompt with playlist details
        const description = `Generate a description for this playlist: "${playlist.title}" by ${playlist.creator}. Songs include: ${songList}.`;

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.href,
                    "X-Title": "Music Playlist Explorer"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: description },
                    ],
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.code === 429) {
                return 'API is temporarily rate-limited. Please try again in a moment.';
            }
            return FAILURE_MESSAGE;
        }

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const summary = data.choices[0].message.content.trim();
            return summary || FAILURE_MESSAGE;
        }

        return FAILURE_MESSAGE;
    } catch (err) {
        console.error("getPlaylistDescription failed:", err);
        return FAILURE_MESSAGE;
    }
}

// Handle AI description button click
async function handleGetDescription() {
    console.log('=== handleGetDescription called ===');
    console.log('currentPlaylist:', currentPlaylist);

    const button = document.querySelector('.get-description-button');
    const descriptionText = document.querySelector('.ai-description-text');

    console.log('Button element:', button);
    console.log('Description text element:', descriptionText);

    if (!button || !descriptionText) {
        console.error('Required elements not found!');
        alert('Error: Button or description text element not found. Check console.');
        return;
    }

    if (!currentPlaylist) {
        console.error('No current playlist!');
        descriptionText.innerText = 'No playlist selected';
        alert('Error: No playlist selected');
        return;
    }

    // Show loading state
    button.disabled = true;
    button.innerText = 'Generating description...';
    descriptionText.innerText = 'Loading...';
    console.log('Loading state set');

    try {
        // Get description
        console.log('Calling getPlaylistDescription...');
        const description = await getPlaylistDescription(currentPlaylist);
        console.log('Got description:', description);

        // Display result
        descriptionText.innerText = description;

        // If it's the failure message, show an alert
        if (description === FAILURE_MESSAGE) {
            alert('API call failed. The model may be rate-limited. Check console for details.');
        }
    } catch (error) {
        console.error('Error in handleGetDescription:', error);
        descriptionText.innerText = FAILURE_MESSAGE;
        alert('Unexpected error: ' + error.message);
    } finally {
        button.innerText = 'Get AI Description';
        button.disabled = false;
        console.log('=== handleGetDescription complete ===');
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

        // Determine if this playlist is liked
        const isLiked = playlist.isLiked || false;
        const likeIcon = isLiked ? '♥' : '♡';
        const likeClass = isLiked ? 'like-button liked' : 'like-button';

        // Create card content
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${playlist.imageUrl}"
                     onerror="this.onerror=null; this.src='${playlist.picsumFallback}';"
                     alt="${playlist.title} cover">
            </div>
            <div class="card-content">
                <h3 class="playlist-title">${playlist.title}</h3>
                <p class="creator-name">${playlist.creator}</p>
                <div class="card-footer">
                    <button class="${likeClass}">${likeIcon}</button>
                    <span class="song-count">${playlist.likes || playlist.songs.length}</span>
                </div>
                <div class="card-actions">
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                </div>
            </div>
        `;

        // Add click handler for opening modal
        const imageContainer = card.querySelector('.card-image-container');
        imageContainer.addEventListener('click', function() {
            openModal(playlist);
        });

        // Add click handler for title/creator area
        const title = card.querySelector('.playlist-title');
        const creator = card.querySelector('.creator-name');
        title.addEventListener('click', function() {
            openModal(playlist);
        });
        creator.addEventListener('click', function() {
            openModal(playlist);
        });

        // Add like button handler
        const likeButton = card.querySelector('.like-button');
        likeButton.addEventListener('click', function(e) {
            toggleLike(e, this, playlist.id);
        });

        // Add edit button handler
        const editButton = card.querySelector('.edit-button');
        editButton.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditPlaylistModal(playlist.id);
        });

        // Add delete button handler
        const deleteButton = card.querySelector('.delete-button');
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            deletePlaylist(playlist.id);
        });

        // Append to container
        container.appendChild(card);
    });
}

// Display featured playlist
function displayFeaturedPlaylist(playlists) {
    // Select random playlist
    const randomIndex = Math.floor(Math.random() * playlists.length);
    const featuredPlaylist = playlists[randomIndex];

    // Update featured playlist info
    const featuredImage = document.getElementById('featured-image');
    featuredImage.src = featuredPlaylist.imageUrl;
    featuredImage.onerror = function() {
        this.onerror = null;
        this.src = featuredPlaylist.picsumFallback;
    };
    document.getElementById('featured-title').innerText = featuredPlaylist.title;
    document.getElementById('featured-creator').innerText = 'By ' + featuredPlaylist.creator;
    document.getElementById('featured-song-count').innerText = featuredPlaylist.songs.length + ' songs';

    // Display songs
    const songListContainer = document.querySelector('.featured-song-list');
    songListContainer.innerHTML = '';

    featuredPlaylist.songs.forEach(function(song, index) {
        const songItem = document.createElement('div');
        songItem.className = 'featured-song-item';

        songItem.innerHTML = `
            <div class="featured-song-number">${index + 1}</div>
            <div class="featured-song-details">
                <p class="featured-song-title">${song.title}</p>
                <p class="featured-song-artist">${song.artist}</p>
                <p class="featured-song-album">${song.album}</p>
            </div>
            <div class="featured-song-duration">${song.duration}</div>
        `;

        songListContainer.appendChild(songItem);
    });

    // Setup shuffle button for featured playlist
    const shuffleButton = document.querySelector('.featured-shuffle-button');
    if (shuffleButton) {
        shuffleButton.onclick = function() {
            displayFeaturedPlaylist(allPlaylists);
        };
    }
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(function(page) {
        page.classList.remove('active');
    });

    // Remove active from all nav buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(function(button) {
        button.classList.remove('active');
    });

    // Show selected page
    if (pageName === 'featured') {
        document.getElementById('featured-page').classList.add('active');
        document.querySelectorAll('.nav-button')[0].classList.add('active');
    } else if (pageName === 'all-playlists') {
        document.getElementById('all-playlists-page').classList.add('active');
        document.querySelectorAll('.nav-button')[1].classList.add('active');
    }
}

// Helper function to get Picsum fallback image
function getPicsumImage(seed, width, height) {
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Load data from JSON file
fetch('data/data.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        allPlaylists = data;

        // Initialize likes property and add Picsum fallbacks for each playlist
        allPlaylists.forEach(function(playlist, index) {
            if (playlist.likes === undefined) {
                // Set first 2 playlists to 0 likes, rest to song count for demonstration
                if (index < 2) {
                    playlist.likes = 0; // Start with 0 likes for testing
                } else {
                    playlist.likes = playlist.songs.length; // Default to song count
                }
            }
            // Add Picsum fallback for playlist image
            if (!playlist.picsumFallback) {
                playlist.picsumFallback = getPicsumImage(`playlist-${playlist.id}`, 400, 400);
            }
            // Add Picsum fallbacks for song images
            playlist.songs.forEach(function(song) {
                if (!song.picsumFallback) {
                    song.picsumFallback = getPicsumImage(`song-${song.id}`, 300, 300);
                }
            });
        });

        filteredPlaylists = [...allPlaylists];

        // Set next IDs based on existing data
        if (allPlaylists.length > 0) {
            nextPlaylistId = Math.max(...allPlaylists.map(p => p.id)) + 1;
            const allSongs = allPlaylists.flatMap(p => p.songs);
            if (allSongs.length > 0) {
                nextSongId = Math.max(...allSongs.map(s => s.id)) + 1;
            }
        }

        createPlaylistCards(filteredPlaylists);
        displayFeaturedPlaylist(allPlaylists);
        setupSearchAndSort();
    })
    .catch(function(error) {
        console.error('Error loading playlist data:', error);
        document.querySelector('.playlist-cards').innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem; color: #3a4042;">Error loading playlists</p>';
    });

// Setup search and sort functionality
function setupSearchAndSort() {
    const searchBar = document.getElementById('search-bar');
    const sortSelect = document.getElementById('sort-select');

    if (searchBar) {
        searchBar.addEventListener('input', function() {
            filterAndDisplayPlaylists();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            filterAndDisplayPlaylists();
        });
    }
}

// Filter and display playlists based on search and sort
function filterAndDisplayPlaylists() {
    const searchBar = document.getElementById('search-bar');
    const sortSelect = document.getElementById('sort-select');

    const searchQuery = searchBar ? searchBar.value.toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';

    // Filter by search query
    filteredPlaylists = allPlaylists.filter(function(playlist) {
        const titleMatch = playlist.title.toLowerCase().includes(searchQuery);
        const creatorMatch = playlist.creator.toLowerCase().includes(searchQuery);
        return titleMatch || creatorMatch;
    });

    // Create a copy of the array for sorting
    let sortedPlaylists = [...filteredPlaylists];

    // Sort playlists
    if (sortBy === 'name') {
        sortedPlaylists.sort(function(a, b) {
            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });
    } else if (sortBy === 'likes') {
        sortedPlaylists.sort(function(a, b) {
            return (b.likes || 0) - (a.likes || 0);
        });
    } else if (sortBy === 'songs') {
        sortedPlaylists.sort(function(a, b) {
            return b.songs.length - a.songs.length;
        });
    }
    // 'default' - no sorting, keep original order

    createPlaylistCards(sortedPlaylists);
}

// Add/Edit Playlist Modal Functions
function openAddPlaylistModal() {
    editingPlaylistId = null;
    document.getElementById('add-edit-modal-title').innerText = 'Add New Playlist';
    document.getElementById('playlist-form').reset();
    document.getElementById('songs-container').innerHTML = '';

    // Add one empty song input by default
    addSongInput();

    document.getElementById('add-edit-modal').style.display = 'flex';
}

function openEditPlaylistModal(playlistId) {
    editingPlaylistId = playlistId;
    const playlist = allPlaylists.find(p => p.id === playlistId);

    if (!playlist) return;

    document.getElementById('add-edit-modal-title').innerText = 'Edit Playlist';
    document.getElementById('playlist-name').value = playlist.title;
    document.getElementById('playlist-creator').value = playlist.creator;
    document.getElementById('playlist-image-url').value = playlist.imageUrl || '';

    // Clear and populate songs
    const songsContainer = document.getElementById('songs-container');
    songsContainer.innerHTML = '';

    playlist.songs.forEach(function(song) {
        addSongInput(song);
    });

    document.getElementById('add-edit-modal').style.display = 'flex';
}

function closeAddEditModal() {
    document.getElementById('add-edit-modal').style.display = 'none';
    document.getElementById('playlist-form').reset();
    editingPlaylistId = null;
}

let songInputCounter = 0;

function addSongInput(song = null) {
    const songsContainer = document.getElementById('songs-container');
    const songDiv = document.createElement('div');
    songDiv.className = 'song-input-group';
    songDiv.dataset.songIndex = songInputCounter++;

    songDiv.innerHTML = `
        <button type="button" class="remove-song-button" onclick="removeSongInput(this)">&times;</button>
        <h4>Song ${songsContainer.children.length + 1}</h4>
        <div class="song-input-row">
            <input type="text" class="song-title-input" placeholder="Song Title" value="${song ? song.title : ''}" required>
            <input type="text" class="song-artist-input" placeholder="Artist" value="${song ? song.artist : ''}" required>
        </div>
        <div class="song-input-row">
            <input type="text" class="song-album-input" placeholder="Album" value="${song ? song.album : ''}" required>
            <input type="text" class="song-duration-input" placeholder="Duration (MM:SS)" value="${song ? song.duration : ''}" required>
        </div>
        <div class="song-input-row">
            <input type="text" class="song-image-input" placeholder="Song Image URL" value="${song ? song.imageUrl : ''}" style="grid-column: 1 / -1;">
        </div>
    `;

    songsContainer.appendChild(songDiv);
}

function removeSongInput(button) {
    const songDiv = button.parentElement;
    songDiv.remove();

    // Renumber remaining songs
    const songsContainer = document.getElementById('songs-container');
    Array.from(songsContainer.children).forEach(function(div, index) {
        div.querySelector('h4').innerText = `Song ${index + 1}`;
    });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const playlistForm = document.getElementById('playlist-form');

    if (playlistForm) {
        playlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePlaylist();
        });
    }
});

function savePlaylist() {
    const name = document.getElementById('playlist-name').value.trim();
    const creator = document.getElementById('playlist-creator').value.trim();
    const imageUrl = document.getElementById('playlist-image-url').value.trim() || 'https://via.placeholder.com/300x300/357a6a/e8ddd2?text=Playlist';

    // Collect songs
    const songsContainer = document.getElementById('songs-container');
    const songInputs = songsContainer.querySelectorAll('.song-input-group');
    const songs = [];

    songInputs.forEach(function(songDiv) {
        const title = songDiv.querySelector('.song-title-input').value.trim();
        const artist = songDiv.querySelector('.song-artist-input').value.trim();
        const album = songDiv.querySelector('.song-album-input').value.trim();
        const duration = songDiv.querySelector('.song-duration-input').value.trim();
        const songImageUrl = songDiv.querySelector('.song-image-input').value.trim() || imageUrl;

        if (title && artist && album && duration) {
            songs.push({
                id: nextSongId++,
                title: title,
                artist: artist,
                album: album,
                duration: duration,
                imageUrl: songImageUrl
            });
        }
    });

    if (songs.length === 0) {
        alert('Please add at least one song to the playlist.');
        return;
    }

    if (editingPlaylistId !== null) {
        // Edit existing playlist
        const playlistIndex = allPlaylists.findIndex(p => p.id === editingPlaylistId);
        if (playlistIndex !== -1) {
            allPlaylists[playlistIndex].title = name;
            allPlaylists[playlistIndex].creator = creator;
            allPlaylists[playlistIndex].imageUrl = imageUrl;
            allPlaylists[playlistIndex].songs = songs;
            // Preserve likes count
            if (allPlaylists[playlistIndex].likes === undefined) {
                allPlaylists[playlistIndex].likes = songs.length;
            }
        }
    } else {
        // Add new playlist
        const newPlaylist = {
            id: nextPlaylistId++,
            title: name,
            creator: creator,
            imageUrl: imageUrl,
            picsumFallback: getPicsumImage(`playlist-${nextPlaylistId}`, 400, 400),
            songs: songs,
            likes: songs.length,
            isLiked: false
        };
        allPlaylists.push(newPlaylist);
    }

    closeAddEditModal();
    filterAndDisplayPlaylists();
    displayFeaturedPlaylist(allPlaylists);
}

function deletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this playlist?')) {
        return;
    }

    const playlistIndex = allPlaylists.findIndex(p => p.id === playlistId);
    if (playlistIndex !== -1) {
        allPlaylists.splice(playlistIndex, 1);
        filterAndDisplayPlaylists();
        displayFeaturedPlaylist(allPlaylists);
    }
}
