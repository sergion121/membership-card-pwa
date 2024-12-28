// Get the video element and source element
const video = document.getElementById("background-video");
const videoSource = document.getElementById("video-source");

// List of video paths
const videoList = [
    "Part_01_edited_v3.mp4",
    "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
    "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

// Track the current video index
let currentVideoIndex = 0;

// Function to play the next video
function playNextVideo() {
    // Update the video index
    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;

    // Update the video source
    videoSource.src = videoList[currentVideoIndex];
    video.load();

    // Ensure the video plays only after it's loaded
    video.addEventListener("loadeddata", () => {
        video.play();
    }, { once: true });

    // Loop only the first video
    video.loop = currentVideoIndex === 0;
}

// Add a click event listener to play the next video
video.addEventListener("click", playNextVideo);
