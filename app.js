// Grab the video and its source
const video = document.getElementById('background-video');
const videoSource = document.getElementById('video-source');

// Our video files
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

// Current index and a flag to track if we've started
let currentVideoIndex = 0;
let hasStarted = false; // Will be false until the first tap plays the first video

// Preload the next video (optional optimization)
function preloadNextVideo() {
  const nextIndex = (currentVideoIndex + 1) % videoList.length;
  const nextVideo = document.createElement('video');
  nextVideo.src = videoList[nextIndex];
  nextVideo.preload = 'auto';
}

// Function to switch videos with fade-out transition
function switchToNextVideo() {
  // Fade out
  video.classList.add('fade-out');

  setTimeout(() => {
    // Move to the next index
    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
    // Update src
    videoSource.src = videoList[currentVideoIndex];
    // Loop only if it's back to the first video
    video.loop = (currentVideoIndex === 0);

    // Remove fade-out for fade-in
    video.classList.remove('fade-out');

    // Load & play
    video.load();
    video.play();

    // Preload subsequent video
    preloadNextVideo();
  }, 500); // match .fade-out transition in CSS
}

// On first tap, we play the first video. On subsequent taps, switch to next video.
function handleTap() {
  if (!hasStarted) {
    // Start the first video
    hasStarted = true;
    // The initial source
    videoSource.src = videoList[currentVideoIndex];
    video.load();
    video.play();
    video.loop = true; // first video loops
    // Optionally preload next
    preloadNextVideo();
  } else {
    // Already started, go to next video
    switchToNextVideo();
  }
}

// Instead of listening on the video itself, listen on the entire document
// This improves reliability of tap detection on iOS
document.body.addEventListener('click', handleTap);
document.body.addEventListener('touchstart', handleTap);

// For debugging or clarity, you can add events like:
video.addEventListener('play', () => {
  console.log('Video playing:', videoSource.src);
});
video.addEventListener('error', (e) => {
  console.error('Video error:', e);
});
