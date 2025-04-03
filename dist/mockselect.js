function getIdFromUrl() {
    // Get the full URL
    const url = window.location.href;
    
    // Find the position of the question mark
    const questionMarkIndex = url.indexOf('?');
    
    // If a question mark exists, extract everything after it
    if (questionMarkIndex !== -1) {
        const id = url.substring(questionMarkIndex + 1);
        return id;
    }
    
    // Return null if no question mark is found
    return null;
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}


$(document).ready(async function () {
    try {
        // Get id from url
        const playlistId = getIdFromUrl();
        // checks if theres an id
        if (!playlistId) {
            console.error("No playlist ID found in URL");
            return;
        }
        // Get and validate access token
        let access_token = getAccessToken();
            
        // Verify we have a valid token
        if (access_token == null) {
            console.error('Error refreshing access token.');
            renderError('Authentication failed. Please log in again.');
            return;
        }
        // Fetch playlist data using fetchPlaylist function
        const { data, status } = await fetchPlaylist(access_token, playlistId);
        
        if (status !== 200 || !data) {
            console.error("Error fetching playlist:", status);
            renderError("Failed to load playlist data");
            return;
        }
        
        console.log("Playlist data:", data);
        songs = data.tracks.sort(() => Math.random() - 0.5);  // Assuming the JSON has a "songs" key
    } catch (error) {
        console.error("Error fetching the JSON file:", error);
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
        card.find(".song_num").text(song_index);
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
                    console.log(`Swiped ${swipe_details.direction === -1 ? "Left" : swipe_details.direction === 1 ? "Right" : "Unknown"}!`);
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
                                songIndex = (songIndex + 1);
                                if (songIndex >= songs.length){
                                    alert("Thank you!\n\nYou have finished the demo, the page will now refresh!")
                                    window.location.reload()
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