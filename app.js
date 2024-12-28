// Grab the video and its source
const video = document.getElementById('background-video');
const videoSource = document.getElementById('video-source');

// Our video files
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

// Tracking
let currentIndex = 0;
let hasStarted = false;

// Function to fully preload a video source
function preloadVideo(url, onReadyCallback) {
  const tempVideo = document.createElement('video');
  tempVideo.src = url;
  tempVideo.preload = 'auto';
  tempVideo.muted = true;        // same attributes as main video
  tempVideo.playsinline = true;
  tempVideo.webkitPlaysinline = true;

  // Once it's ready to play, call the callback
  tempVideo.addEventListener('canplay', () => {
    onReadyCallback();
  });
}

// Function to switch to a specific index
function switchToVideo(newIndex) {
  const nextSrc = videoList[newIndex];

  // Preload next video
  preloadVideo(nextSrc, () => {
    // Once next video is ready to play...
    // Fade out the current
    video.classList.add('fade-out');

    setTimeout(() => {
      // Update the main video source
      videoSource.src = nextSrc;
      // Loop only if it's index 0
      video.loop = (newIndex === 0);

      // Reload and play
      video.load();
      video.play().catch(err => {
        console.log('Video play error:', err);
      });

      // Remove fade-out to fade back in
      video.classList.remove('fade-out');

      // Update the currentIndex
      currentIndex = newIndex;
    }, 500); // match .fade-out transition time
  });
}

// First user tap => start the first video
// Next taps => go to next video
function handleTap() {
  if (!hasStarted) {
    hasStarted = true;
    // Start with the first video (index 0), already looped
    switchToVideo(0);
  } else {
    // Move to next
    const nextIndex = (currentIndex + 1) % videoList.length;
    switchToVideo(nextIndex);
  }
}

// Listen for taps anywhere
document.body.addEventListener('click', handleTap);
document.body.addEventListener('touchstart', handleTap);

// Optional debugging
video.addEventListener('play', () => {
  console.log('Playing:', videoSource.src);
});
video.addEventListener('error', (e) => {
  console.error('Video error:', e);
});
