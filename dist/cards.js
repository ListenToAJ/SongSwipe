$(document).ready(async function () {
    // MAKE BUTTON PRETTY
    // alert("Welcome to the SongSwipe demo!\n\nShown here is the swiping interface loaded with a existing Spotify playlist.\n\nSwipe right on songs you like\nSwipe left on ones you don't!")
    // TEMPORARY TESTING SONG LOADING
    // try {
    //     const response = await fetch("whitegirlbangers.json");
    //     const data = await response.json();
    //     songs = data.tracks.sort(() => Math.random() - 0.5);  // Assuming the JSON has a "songs" key
    // } catch (error) {
    //     console.error("Error fetching the JSON file:", error);
    // }
    let access_token = localStorage.getItem('access_token');
    const headers = new Headers();
    headers.set('Authorization', access_token);
    headers.set('Access-Control-Allow-Origin', '*');

    // Hide Overlay Button until all the songs are loaded
    const closeButton = document.getElementById('close-overlay');
    closeButton.classList.add('hidden');
    // Overlay Variables
    overlay_playlist_title = document.getElementById('loading_playlist_title_variable');
    // Song_player object
        // Empty song file instead of null
    let song_player = new Audio("https://bigsoundbank.com/UPLOAD/mp3/0917.mp3");
    // Variable to control if playing
    let isPlaying = true;
    
    // Get Specific Playlist
    var songs = null;

    // Needed data for stuff
    let playlist_name = null;
    let playlist_id = null;

    // Get User Data
    let user_id = await getUserId();
    let user = null;
    let user_status = 0;

    // Array to keep track of tracks
    let right_tracks = [];
    let left_tracks = [];

    // index to keep track of the tracks
    track_index = 0;

    // Get playlist information from href
    try {
        const url = new URL(window.location.href);
        playlist_id = url.searchParams.get('playlist_id');
        if (playlist_id == null) {
            renderError('No Playilst Id Provided!');
        }

        if (checkAccessTokenExpiration()) access_token = refreshAccessToken();
        if (access_token == null) renderError('Error refreshing access token.');

        let playlist_url = new URL(`${API_URI}/playlist/build`);
        playlist_url.searchParams.set('playlist_id', playlist_id);

        const playlist_request = new Request(playlist_url.toString(), {
            method: 'GET',
            headers: headers,
        })

        const response = await fetch(playlist_request);
        if (response.status != 200) {
            renderError('Playlist is not compatible.');
            return;
        }
        
        const data = await response.json();
        songs = data.tracks.sort(() => Math.random() - 0.5);  

        playlist_title = document.getElementById('playlist_title_variable');
        // Overlay Items
        const overlay_playlist_name = document.getElementById('loading_title');
            // Get Playlist Name
        overlay_playlist_name.textContent = (data.name);
            // Get Album Cover
        const loading_album_art = document.getElementById('loading_album_art');
        loading_album_art.src = data.img_url;
        // Save the name of the playlist for now
        playlist_name = data.name;

    } catch (error) {
        renderError(error);
    }

    // Read Local Storage first before loading songs
    try {
        user = JSON.parse(localStorage.getItem(user_id));
        if (user === null) {
            // new person hehe
            user_status = 1;
        } else {
            // declare user status
            user_status = 3;
            // current user's playlist if its the same one
            console.log(user);
            for (let i = 0; i < user.playlists.length; i++) {
                if (user.playlists[i].playlist_id == playlist_id) {
                    user_status = 2;
                    left_tracks = user.playlists[i].left_tracks;
                    right_tracks = user.playlists[i].right_tracks;
                    break;
                }
            }
        }
    } catch (error) {
        alert(error);
    }

    // remove songs from the Songs array if there is any
    if (right_tracks !== null){
        reloadPlaylist(right_tracks, songs);
    }
    if (left_tracks !== null){
        reloadPlaylist(left_tracks, songs);
    }

    // wait to get all the URLS
    let song_url = await getURL();

    // Once loaded, put playlist name
    playlist_title.innerHTML = playlist_name;

    // Make an array to hold URLS
    async function getURL() {
        // Declare empty
        let song_url = [];
        for (let i = 0; i < songs.length; i++) {
                // Use songs[i] to access the current song, not song
                let songPreview_url = new URL(`${API_URI}/song`);
                songPreview_url.searchParams.set('track_id', songs[i].track_id);
                
                // API Request
                const songPreview_request = new Request(songPreview_url.toString(), {
                    method: 'GET',
                    headers: headers,
                });
                
                try {
                    // Fetch MP3 URL
                    const response = await fetch(songPreview_request);
                    const data = await response.json();
                    song_url.push(data);
                    overlay_playlist_title.innerHTML = (`Loading Songs ... ${i+1}/${songs.length}`);
                } catch (error) {
                    console.error(`Error fetching song ${i+1}:`, error);
                }
            }
            // Show Button Because it is finished Loading
            closeButton.classList.remove('hidden');
            return song_url;
    }

    // Refactor function to stop playing
    function notPlaying() {
        // Reset UI state regardless of error type
        $(".song_button").removeClass('playing');
        isPlaying = false;
    }

    // Refactor to play songs
    function playSong() {
        song_player.play()
            .then(() => {
                $(".song_button").addClass('playing');
                isPlaying = true;
            })
            .catch(error => {
                // Use switch statement to handle different error types
            switch (error.name) {
                case 'NotSupportedError':
                    console.log(song_url[track_index]);
                    console.error("The audio format is not supported by this browser:", error);
                    alert("Audio Not Supported");
                break;
                
                case 'AbortError':
                    console.error("Playback was aborted:", error);
                    alert("Playback was aborted :P");
                break;
                
                case 'NotAllowedError':
                    console.error("Playback not allowed (autoplay policy):", error);
                    alert("Please interact with the page first to enable audio playback.");
                break;
                
                default:
                    // Handle any other errors
                    console.error("Error playing audio:", error);
                    alert("Audio Playback Error");
                break;
            }
                notPlaying();
            });
    }

    // function to play the song at a specific index
    function songPlayer(index) {
        // Make sure it is a valid index
        if (index >= 0 && index < song_url.length) {
            const this_song = song_url[index];
            
            // Make sure song_player is defined and is an audio element
            if (song_player && song_player instanceof HTMLAudioElement) {
                song_player.src = this_song;
                song_player.load();
                playSong();
            } else {
                console.error("song_player is not properly defined");
            }
        // Error handling for when its bad
        } else {
            alert("Error with indexing in song_player");
        }
    }

    /**
     * Updates the song information on a specific card element.
     * 
     * @param {number} song_index - The index of the song in the `songs` array.
     * @param {string} card_id - The ID of the card to update (e.g., "song_card", "next_song_card", "last_song_card").
     */
    function updateSongCard(song_index, card_id) {
        const card = $("#" + card_id);
        // Update div info
        card.find(".song_info .bold_title").text(truncateString(20, songs[song_index].name));
        card.find(".song_info .subtitle").text(songs[song_index].artists[0]);
        card.find(".album").attr("src", songs[song_index].album_cover_img_url);
        // Have it show from 1  - Last song in playlist for people reading
        card.find(".song_num").text(song_index + 1);
    }

    // max length of 24 for now
    function truncateString(max_length, string) {
        if (string.length > max_length){
            return string.substring(0,max_length) + " . . ."
        }
        return string
    }

    songIndex = 0;
    updateSongCard(songIndex, "song_card");
    songIndex += 1;
    updateSongCard(songIndex, "next_song_card");
    songIndex += 1;
    updateSongCard(songIndex, "last_song_card");

// Play/pause toggle button
$(".song_button").click(function() {
    // Make sure we have a song player
    if (!song_player) {
        console.error("No audio player available");
        return;
    }
    
    // Toggle play state
    if (isPlaying) {
        // Currently playing, so pause
        song_player.pause();
        notPlaying();
    } else {
        // Currently paused, so play
        playSong();
    }
});

$(".back_button").click(function() {
    save();
    window.location.href = "playlists.html";
});

// Saves the JSON
function save() {
    const thisJSON = getJSON();
    localStorage.setItem(user_id, JSON.stringify(thisJSON));
    console.log(thisJSON);
}

// Restart Song Button aka start from 0
$(".song_restart").click(function() {
    // Make sure we have a song player
    if (!song_player) {
        console.error("No audio player available");
        return;
    }
    song_player.currentTime = 0;
    playSong();
});

song_player.addEventListener('ended', function() {
    notPlaying();
});

// Make save JSON
    // Function for when there is a new user so this is there new playlist addition
function getJSON() {
    // make playlist object
    thisPlaylist = getPlaylist();

    //make user Json based on status
    if (user_status === 1) {
        const username_id = {
            playlists: [thisPlaylist]
        };
        return username_id;
    } else if (user_status === 3) { // User is working on new playlist
        // Make the object an array first
        user.playlists.push(thisPlaylist);
        return user;
    } else if (user_status === 2) {
        // find playlist index in the array
        const playlist_index = user.playlists.findIndex(playlist => playlist.playlist_id === playlist_id);
        
        // Confirm index is found
        if (playlist_index !== -1) {
        // remove recent save
            user.playlists.splice(playlist_index, 1);
            // push new save in
            user.playlists.push(thisPlaylist);
            return user;
        } else {
            alert("Cannot find playlist")
        }
    }
}

function getPlaylist() {
    const thisPlaylist = {
        playlist_id: playlist_id,
        left_tracks: left_tracks,
        right_tracks: right_tracks,
        index: track_index
    };
    return thisPlaylist;
}

function removePlaylist() {
    if (user_status === 1) {
        // Do NOT SAVE
        return;
    }
    // If user was working on a playlist, remove it from local storage as they are done
    // Finds location of playlist in the array
    const playlist_index = user.playlists.findIndex(playlist => playlist.playlist_id === playlist_id);
    // Removes that playlist because reviewing playlist is over
    if (playlist_index !== -1) {
        // remove playlist
            user.playlists.splice(playlist_index, 1);
            // If theres no more playlists saved, delete local record
            if (user.playlists.length === 0) {
                localStorage.removeItem(user_id);
            } else {
                // Update the user data in localStorage
                localStorage.setItem(user_id, JSON.stringify(user));
            }
    } else {
        console.log("Cannot find playlist when removing");
    }
    
}

// Get UserID
async function getUserId() {
    const request_user = new Request(`${API_URI}/user`, {
        method: 'GET',
        headers: headers,
    });

    const response_user = await fetch(request_user);
    const data_user = await response_user.json();
    return data_user.id;
}

function reloadPlaylist(reference, target) {
    for (let x = 0; x < reference.length; x++) {
        const song_index = target.findIndex(target => target.track_id === reference[x]);
        
        // Confirm index is found
        if (song_index !== -1) {
        // remove 'seen' tracks from current playlist to simulate where you last left off
            target.splice(song_index, 1);
        } else {
            alert("Cannot find Reference or Target")
        }
    }
}

// Function to have an overlay when loading in songs
const overlay = document.getElementById('overlay');

// Close overlay when button is clicked
closeButton.addEventListener('click', function() {
    overlay.classList.add('hidden');
    // Starts playing by default
        // Plays song at the start of the tracklist
    songPlayer(track_index);
});

    //! Listener for reloading app for testing on mobile (REMOVE LATER)
    // $("#playlist_title").on("click touchstart", function (e) {
    //     alert("Reloading...");
    //     location.reload();
    // });


    //! Swiping action listener and logic
    const SWIPE_SENSITIVITY = window.innerWidth / 1;    // Animation sensitivity
    const DISTANCE_TO_SWIPE = window.innerWidth / 3;    // Distance it takes to fully swipe either left or right
    const ANGLE_OF_ALLOWANCE = 90;    // The angle width directly left and right that is allowed for swiping

    let tracking = false;
    let startX, startY = false;
    let completed_swipe = false;

    /**
     * Computes the swipe details, including distance, angle, and direction.
     * 
     * @param {Object} event - The touch event.
     * @returns {Object} - An object containing the distance, angle, and direction of the swipe.
     *   - distance: The swipe distance.
     *   - angle: The angle of the swipe in degrees (0 to 360).
     *   - direction: The direction of the swipe (-1 for left, 1 for right, 0 for no swipe).
     */
    function computeSwipeDetails(event) {
        let clientX, clientY;
    
        if (event.touches) {
            // Handle touch event
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // Handle mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
    
        swipe_start = [startX, startY];
        swipe_current = [clientX, clientY];
    
        // Compute the distance (Euclidean distance)
        let sumOfSquares = 0;
        for (let i = 0; i < swipe_start.length; i++) {
            let diff = swipe_current[i] - swipe_start[i];
            sumOfSquares += diff * diff;
        }
        const distance = Math.sqrt(sumOfSquares);
        const angle = getAngle(swipe_start, swipe_current);
        let direction;
    
        if (angle < 180 + ANGLE_OF_ALLOWANCE / 2 && angle > 180 - ANGLE_OF_ALLOWANCE / 2) {
            direction = -1;
        } else if (angle > 360 - ANGLE_OF_ALLOWANCE / 2 || angle < 0 + ANGLE_OF_ALLOWANCE / 2) {
            direction = 1;
        } else {
            direction = 0;
        }
    
        return {
            distance: distance, 
            angle: angle,       
            direction: direction 
        };
    }
    

    /**
     * Calculates the angle between two points in a 2D plane.
     * 
     * @param {Array} center - The starting point [x, y].
     * @param {Array} point - The destination point [x, y].
     * @returns {number} - The angle between the points in degrees (0 to 360).
     */
    function getAngle(center, point) {
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];

        let angleRad = Math.atan2(dy, dx);
        let angleDeg = angleRad * (180 / Math.PI);

        // Normalize to 0–360° (if negative, add 360)
        if (angleDeg < 0) {
            angleDeg += 360;
        }

        return angleDeg;
    }

    // When finger is pressed on card...
    $("#app_container").on("touchstart", "#song_card", function (event) {
        tracking = true; // Start tracking finger travel distance

        let touch = event.touches[0]; // Get first touch point
        startX = touch.clientX;
        startY = touch.clientY;
    });

    // While finger is moving...
    $("#app_container").on("touchmove", "#song_card", function (event) {
        if (tracking) {
            swipe_details = computeSwipeDetails(event);
            
            // If swipe has been determined as valid and within angle of allowance
            if (swipe_details.direction == -1 || swipe_details.direction == 1) {
                swipe_percentage = swipe_details.distance / SWIPE_SENSITIVITY;

                // Convert swipe status into animation details
                var translateX = (swipe_percentage * swipe_details.direction * 450);
                var rotateDeg = (swipe_percentage * swipe_details.direction * 20);

                // Animate the swipe at whatever state its at
                const card = document.getElementById("song_card");
                card.style.transform = `translateX(${translateX}px) rotate(${rotateDeg}deg)`;

                // If the song has been completed_swipe enough to declare it left or right swipe
                if (swipe_details.distance > DISTANCE_TO_SWIPE) {
                    if (swipe_details.direction === -1) {
                        left_tracks.push(songs[track_index].track_id);
                        save()
                    }
                    if (swipe_details.direction === 1) {
                        right_tracks.push(songs[track_index].track_id);
                        save()
                    }
                    // Plays new song after swipe
                    track_index += 1;
                    if (track_index < song_url.length) {
                        songPlayer(track_index);
                    }

                    tracking = false;
                    completed_swipe = true;

                    // Add transition for smooth animation
                    $("#song_card").css({
                        'transition': 'transform 0.3s ease-out'
                    });

                    // Get finished animation details
                    const finalX = swipe_details.direction * window.innerWidth * 1.5;
                    const finalRotation = swipe_details.direction * 30;

                    // Apply the final transform to animate the card off-screen
                    $("#song_card").css({
                        'transform': `translateX(${finalX}px) rotate(${finalRotation}deg)`
                    });

                    // Once front song is fully out of frame
                    $("#song_card").one('transitionend', function () {
                        // Variables for readability
                        let $next = $("#next_song_card");
                        let $current = $("#song_card");

                        // Clone final song card upward
                        let $last = $("#last_song_card").clone();
                        $next.after($last);

                        // Ensure the transition is applied to all involved elements before class swap
                        $next.css("transition", "all 0.05s ease-in-out");
                        $last.css("transition", "all 0.1s ease-in-out");

                        // Add a small delay to ensure the $last element is rendered properly
                        setTimeout(() => {
                            // Swap classes and apply transitions (Moving both cards upward to fill space left by swipe)
                            $next.addClass("song_card").removeClass("next_song_card");
                            $last.addClass("next_song_card").removeClass("last_song_card");

                            // Wait for the transition to finish, then remove transition property
                            $last.one("transitionend", function () {
                                // Remove all transition properties to start with clean slate for future swipes
                                $next.css("transition", ""); 
                                $current.css("transition", "");
                                $last.css("transition", "");
                                $last.find(".song_info_container").show();

                                // Swap IDs
                                $current.remove();  // Delete swiped card element
                                $next.attr("id", "song_card");  // Move other two upward
                                $last.attr("id", "next_song_card");

                                // Temporary population of final card
                                //! IMPORTANT : THIS IS WHERE NEW SONGS NEED TO BE PLACED VIA API TO BE ADDED TO SWIPING ROTATION ! ! ! ! ! ! 
                                if (songIndex < song_url.length - 1) {
                                    songIndex  += 1;
                                    console.log(track_index);
                                }
                                if (track_index === song_url.length) {
                                    // Save the playlist to local storage
                                    removePlaylist();
                                    
                                    window.location.reload();
                                }
                                updateSongCard(songIndex, "last_song_card");
                                completed_swipe = false;
                            });
                        }, 10); // Delay the class swapping to allow for smooth transition
                    });
                    return;
                }
            }
        }
    });

    // When finger is lifted...
    $("#app_container").on("touchend", "#song_card", function (event) {
        // If swipe has not been finished
        if (completed_swipe == false) {
            tracking = false; // Stop tracking when finger is lifted

            // Reset to original position and rotation
            $("#song_card").css({
                'transition': 'transform 0.2s',             
                'transform': 'translateX(0px) rotate(0deg)' 
            });
        }
    });
});
