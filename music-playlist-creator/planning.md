## Music Playlist Explorer — Planning Spec

### Data Shape

**Playlist Object:**
- id (number) — unique identifier for the playlist
- title (string) — the name of the playlist displayed on the card and in the modal
- creator (string) — the name of the person or entity who created the playlist
- imageUrl (string) — the path to the playlist cover image
- songs (array) — array of song objects that belong to this playlist

**Song Object:**
- id (number) — unique identifier for the song
- title (string) — the name of the song
- artist (string) — the artist who performs the song
- album (string) — the album the song belongs to
- imageUrl (string) — the path to the song's cover art
- duration (string) — the length of the song in MM:SS format


### UI and Interaction Rules
What are the main sections of the homepage?
The main sections of the home page will be the header with a hamburger nav bar and title. The body will consist of cards of various music albums or playlists with a cover image, title of playlist and who created it. 

What happens when a user clicks a playlist card?
When you click a playlist card, a pop up will appear consisting of the playlist card as the head of the pop up and the body of sections consisting of the songs with an image, name of song, and artist.

What happens when a user clicks outside the modal?
It exits the playlist pop up. 

What happens when a user clicks the like icon?
A highlight of the like button will be highlighted indicating it has been clicked and be added to a liked songs playlist. 

What does the shuffle button do?
Randomly shuffle the songs in a specific playlist. 

### Function Specs

**shuffleSongs(songs)**
- Takes in array of song objects
- Returns new array with songs in random order
- Does not modify the original array
- Uses Fisher-Yates shuffle algorithm

**toggleShuffle()**
- Toggles between shuffled and unshuffled state
- When not shuffled: creates NEW random order from original, changes button to red, text to "Unshuffle"
- When shuffled: restores original order, changes button to green, text to "Shuffle"
- Each shuffle click produces a different random order
- Original song order preserved in originalSongOrder variable
- Updates display with displaySongs() function
**createPlaylistCards(playlists)**
- Takes in array of playlist objects
- Creates a card for each playlist and adds to `.playlist-cards` container
- Uses: id, title, creator, imageUrl, songs.length
- Shows "No playlists found" if array is empty

**openModal(playlist)**
- Takes in a playlist object
- Updates modal with playlist info and shows it
- Updates: `.modal-playlist-title`, `.modal-playlist-image`, `.modal-creator-name`, `.song-list`, `#modal-overlay`
- Creates a song item for each song in the playlist
- Shows "No songs in this playlist" if playlist has no songs

**toggleLike(event, button)**
- Takes in click event and button element
- Toggles like state by switching between ♡ and ♥
- When liked: adds 'liked' class, changes to ♥, turns red
- When unliked: removes 'liked' class, changes to ♡, turns grey
- Stops event from bubbling to card
- Only color changes, no size changes

**Design Specs:**
*Plan to use emerald green and cream colors ( #CCBCAF for cream, #439A86 for green, and #46494C for the 
colors used. 
*for any hover or clicking i want a shadow or darkened color for the button or interactive piece. 
*curved images for albums, light border for each card, when a heart is clicked it is highlighted to red,
*add functionality for the heart when you click it adds 1, if clicked again it is removed and goes down to 0 
*the modal should look similar in colors and fonts to the home page, lines or border going through showing where to click to select song, also provide a play and pause button. 
*add a piano major scale sound everytime something is clicked 

### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

### Decisions Log
*