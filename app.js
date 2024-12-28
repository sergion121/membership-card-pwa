// Get the video element and source element
const video = document.getElementById("background-video");
const videoSource = document.getElementById("video-source");

// List of video paths in the "MP4" folder
const videoList = [
    "Part_01_edited_v3.mp4",
    "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
    "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

// Current video index
let currentVideoIndex = 0;

// Function to switch to the next video
function playNextVideo() {
    // Move to the next video in the sequence
    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;

    // Update the video source
    videoSource.src = videoList[currentVideoIndex];

    // Set looping for the first video only
    video.loop = currentVideoIndex === 0;

    // Load and play the new video
    video.load();
    video.play();
}

// Event listener for clicks or taps
video.addEventListener("click", playNextVideo);

// Error handling for unsupported video formats
video.addEventListener("error", () => {
    console.error("Error: Unable to play video. Check file format or path.");
    alert("There was an error playing the video. Please try again.");
});
