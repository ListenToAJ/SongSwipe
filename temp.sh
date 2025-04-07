#!/bin/zsh

# Simple zsh script to parse a Spotify playlist JSON file
# and display each song name with its first artist one at a time

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: This script requires jq to be installed."
    echo "Please install it with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Get the filename from the first argument or use default
FILENAME="${1:-whitegirlbangers.json}"

# Check if the file exists
if [[ ! -f "$FILENAME" ]]; then
    echo "Error: File '$FILENAME' not found."
    exit 1
fi

# Get total number of songs
TOTAL=$(jq '.tracks | length' "$FILENAME")
echo "Playlist: $(jq -r '.name' "$FILENAME")"
echo "Total songs: $TOTAL"
echo "Press Enter to show each song..."
read

# Use a loop to go through each track and wait for Enter between each one
for ((i=0; i<TOTAL; i++)); do
    # Extract and print the current song and artist
    SONG=$(jq -r ".tracks[$i].name" "$FILENAME")
    ARTIST=$(jq -r ".tracks[$i].artists[0]" "$FILENAME")
    
    echo "[$((i+1))/$TOTAL] $SONG - $ARTIST"
    
    # Don't wait for input after the last song
    if [[ $i -lt $((TOTAL-1)) ]]; then
        echo "Press Enter for next song..."
        read
    fi
done

echo "\nEnd of playlist!"