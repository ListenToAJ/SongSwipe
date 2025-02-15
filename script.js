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
    const DISTANCE_TO_SWIPE = window.innerWidth / 4;
    let ANGLE_OF_ALLOWANCE = 60

    // Start tap on card by recording where finger is placed
    $("#song_card").on("touchstart", function (event) {
        tracking = true; // Start tracking finger travel distance

        let touch = event.touches[0]; // Get first touch point
        startX = touch.clientX;
        startY = touch.clientY;
    });

    // While finger is moving..
    $("#song_card").on("touchmove", function (event) {
        if (tracking) {
            finger_travel = computeSwipeDetails(event);
            const now = Date.now();
            // Logging swipe percentage for testing
            if (now - last_update_time >= 100) {
                console.clear()
                console.log(Math.floor(finger_travel.distance / DISTANCE_TO_SWIPE * 100) + "%");
                last_update_time = now;
            }


            // Swipe left detection (distance and angle)
            if (finger_travel.distance > DISTANCE_TO_SWIPE) {
                if (finger_travel.angle < 180 + ANGLE_OF_ALLOWANCE / 2
                    && finger_travel.angle > 180 - ANGLE_OF_ALLOWANCE / 2
                ) {
                    console.log("Swiped left!")
                    tracking = false
                    return
                }

                // Swipe left detection (distance and angle)
                if (finger_travel.angle > 360 - ANGLE_OF_ALLOWANCE / 2
                    || finger_travel.angle < 0 + ANGLE_OF_ALLOWANCE / 2
                ) {
                    console.log("Swiped right!")
                    tracking = false
                    return
                }

            }
        }
    });

    $("#song_card").on("touchend", function (event) {
        tracking = false; // Stop tracking when finger is lifted
    });

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

        // Return the result: distance, and angle
        return {
            distance: distance, // Distance with sign based on direction
            angle: angle                 // Angle in degrees (0 to 360 range)
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
});
