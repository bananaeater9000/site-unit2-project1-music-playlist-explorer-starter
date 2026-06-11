## Music Playlist Explorer — Planning Spec

### Data Shape

**Playlist Object:**
- id (number) - unique playlist identifier
- title (string) - playlist name
- creator (string) - who made it
- imageUrl (string) - playlist cover image
- songs (array) - list of song objects

**Song Object:**
- id (number) - unique song identifier
- title (string) - song name
- artist (string) - artist name
- album (string) - album name
- imageUrl (string) - song cover art
- duration (string) - song lenght in MM:SS


### UI and Interaction Rules

**Main sections:**
- Header with title and dark mode toggle
- Side nav bar with page links
- Cards showing playlists with images and titles

**Click playlist card:**
- Modal opens with playlist details
- Shows all songs in a list
- Can shuffle or get AI desription

**Click outside modal:**
- Modal closes and returns to main page

**Click like icon:**
- Heart turns red when liked
- Like count goes up by 1
- Click again to unlike and count goes down

**Shuffle button:**
- Randomizes song order in playlist
- Can unshuffle to restore orignal order 

### Function Specs

**shuffleSongs(songs)**
- Takes array of song objects
- Returns new array with random order
- Uses Fisher-Yates algorythm
- Doesn't change original array

**displayFeaturedPlaylist(playlists)**
- Takes array of playlists
- Picks random playlist using Math.random()
- Shows playlist image, title, creator
- Displays all songs from playlist
- Runs on page load

**createPlaylistCards(playlists)**
- Takes playlist array
- Creates card for each playlist
- Shows image, title, creator, like button
- If empty shows "No playlists found"

**toggleLike(event, button, playlistId)**
- Takes click event, button, and playlist ID
- Switches between liked/unliked
- Updates like count (+1 or -1)
- Changes heart color red/grey
- Re-sorts if sorted by likes

**getPlaylistDescription(playlist)**
- Takes playlist object
- Calls OpenRouter API with song list
- Returns AI generated description (2-3 sentances)
- Returns "Description unavailable" on error

### Featured Page

**Random Playlist Display:**
- Page loads with random playlist selcted
- Shows large playlist image on left side
- Right side shows all songs with details
- Includes playlist title, creator, and song count
- Shuffle button picks new random playlist
- Play Now button for future functionality

**Layout:**
- Split 50/50 between image and song list
- Song list is scrollable if too many songs
- All info displayed at once (no clicking)

**Design Specs:**
- Use emerald green (#439A86) and cream (#CCBCAF) colors
- Hover effects with shadows and darker colors
- Rounded images with light borders on cards
- Heart turns red when clicked
- Like counter adds 1 when clicked, subtracts 1 when unclicked
- Modal matches homepage colors and fonts
- Borders show where to click 

### AI Feature Spec

**Role:** Music curator who understands playlists

**Task:** Generate description for playlist

**Inputs:** 
- Playlist title and creator
- List of songs with artists

**Output:** 2-3 sentances about playlist vibe and mood

**Constraints:** 
- Don't list individual songs
- No generic marketing language

**Failure:** Shows "Description unavailable" if API fails

### Decisions Log

**Milestone 7 - Featured Page:**
- Used Math.random() to pick random playlist each time
- Split page into two sections using flexbox
- Added shuffle button to change featured playlist
- Had some trouble with overflow but fixed with scrollbar

**Milestone 8 - AI Descriptions:**
- First try worked pretty good, got 2-3 sentance descriptions
- Seperated system prompt from user prompt for better results
- Tested failure with bad API key - showed fallback message correctly
- Would add token limit in future to keep it shorter