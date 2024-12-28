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

// Function to preload the next video
function preloadNextVideo() {
    const nextIndex = (currentVideoIndex + 1) % videoList.length;
    const nextVideo = document.createElement('video');
    nextVideo.src = videoList[nextIndex];
    nextVideo.preload = 'auto';
}

// Function to play the next video with fade transition
function playNextVideo() {
    // Add fade-out class to initiate opacity transition
    video.classList.add('fade-out');

    // Wait for the fade-out transition to complete
    setTimeout(() => {
        // Update the video index
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;

        // Update the video source
        videoSource.src = videoList[currentVideoIndex];
        video.loop = (currentVideoIndex === 0); // Loop only the first video

        // Remove the fade-out class to fade in the new video
        video.classList.remove('fade-out');

        // Load and play the new video
        video.load();
        video.play();

        // Preload the subsequent video
        preloadNextVideo();
    }, 500); // Duration matches the CSS transition (0.5s)
}

// Ensure the first video loops and preload the next video on load
video.addEventListener('loadeddata', () => {
    video.loop = true;
    preloadNextVideo();
}, { once: true });

// Add a click event listener to play the next video
video.addEventListener("click", playNextVideo);
