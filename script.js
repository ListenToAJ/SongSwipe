$(document).ready(function () {
    //! Listener for reloading app for testing on mobile (REMOVE LATER)
    $("#playlist_title").on("click touchstart", function (e) {
        alert("Reloading...");
        location.reload();
    });
    
    //! Swiping action listener and logic
    let tracking = false;
    let startX, startY = false;
    let last_update_time = 0;
    const SWIPE_SENSITIVITY = window.innerWidth / 1;
    const DISTANCE_TO_SWIPE = window.innerWidth / 2.5;
    let ANGLE_OF_ALLOWANCE = 90;    // The angle width directly left and right that is allowed for swiping
    
    function computeSwipeDetails(event) {
        let touch = event.touches[0]; // Get first touch point
        swipe_start = [startX, startY]
        swipe_current = [touch.clientX, touch.clientY]
    
        // Compute the distance (Euclidean distance)
        let sumOfSquares = 0;
        for (let i = 0; i < swipe_start.length; i++) {
            let diff = swipe_current[i] - swipe_start[i];
            sumOfSquares += diff * diff;
        }
        const distance = Math.sqrt(sumOfSquares);
        const angle = getAngle(swipe_start, swipe_current)
        let direction
    
        if (angle < 180 + ANGLE_OF_ALLOWANCE / 2 && angle > 180 - ANGLE_OF_ALLOWANCE / 2){
            direction = -1
        } else if (angle > 360 - ANGLE_OF_ALLOWANCE / 2 || angle < 0 + ANGLE_OF_ALLOWANCE / 2){
            direction = 1
        } else{
            direction = 0
        }

        // Return the result: distance, and angle
        return {
            distance: distance, // Distance with sign based on direction
            angle: angle,                 // Angle in degrees (0 to 360 range)
            direction: direction
        };
    }
    
    function getAngle(center, point) {
        // Calculate the differences
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];
    
        // Get the angle in radians from the positive x-axis
        let angleRad = Math.atan2(dy, dx);
    
        // Convert to degrees
        let angleDeg = angleRad * (180 / Math.PI);
    
        // Normalize to 0–360° (if negative, add 360)
        if (angleDeg < 0) {
            angleDeg += 360;
        }
    
        return angleDeg;
    }
    
    // Start tap on card by recording where finger is placed
    $("#song_card").on("touchstart", function (event) {
        tracking = true; // Start tracking finger travel distance
        
        let touch = event.touches[0]; // Get first touch point
        startX = touch.clientX;
        startY = touch.clientY;
    });

    swiped = false

    // While finger is moving..
    $("#song_card").on("touchmove", function (event) {

        if (tracking) {
            swipe_details = computeSwipeDetails(event);
            // swipe_direction = validateAngle(finger_travel.angle)

            if(swipe_details.direction == -1 || swipe_details.direction == 1){
                swipe_percentage = swipe_details.distance / SWIPE_SENSITIVITY

                // Calculate the translateX distance based on the value
                var translateX = (swipe_percentage * swipe_details.direction * 450)
                var rotateDeg = (swipe_percentage * swipe_details.direction * 20)
                
                // Apply the calculated transform   
                const card = document.getElementById("song_card");
                card.style.transform = `translateX(${translateX}px) rotate(${rotateDeg}deg)`;
                    $("#song_card").one('transitionend', function() {                    
                    // Remove the transition after the animation completes to allow future animations to use their own timing
                    $(this).css('transition', ''); // Remove the transition prope
                });

                if(swipe_details.distance > DISTANCE_TO_SWIPE){
                    console.log(`Swiped ${swipe_details.direction === -1 ? "Left" : swipe_details.direction === 1 ? "Right" : "Unknown"}!`)
                    tracking = false
                    swiped = true
                    
                    // Add transition for smooth animation
                    $("#song_card").css({
                        'transition': 'transform 0.3s ease-out'
                    });
                    
                    // Calculate final position based on swipe direction (off-screen)
                    const finalX = swipe_details.direction * window.innerWidth * 1.5;
                    const finalRotation = swipe_details.direction * 30;
                    
                    // Apply the final transform to animate the card off-screen
                    $("#song_card").css({
                        'transform': `translateX(${finalX}px) rotate(${finalRotation}deg)`
                    });
                    
                    // Hide the card only after the animation completes
                    $("#song_card").one('transitionend', function() {
                        $(this).hide();
                    });
                    
                    return
                }
                
            }
        }
    });

    $("#song_card").on("touchend", function (event) {
        if(swiped == false){
            tracking = false; // Stop tracking when finger is lifted
            $("#song_card").css({
                'transition': 'transform 0.2s', // Set the transition duration to 2 seconds
                'transform': 'translateX(0px) rotate(0deg)' // Reset to original position and rotation
            });
        }
    });
});
