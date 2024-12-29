/**********************************************
 * Config: List your video files here
 **********************************************/
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

/**********************************************
 * State variables
 **********************************************/
let currentIndex = 0;
let allVideos = [];  // will hold references to the <video> elements
let videosLoadedCount = 0;
let isAppStarted = false; // user has tapped to actually start playback?

/**********************************************
 * DOM elements
 **********************************************/
const loadingScreen = document.getElementById("loading-screen");
const videoContainer = document.getElementById("video-container");
const startOverlay = document.getElementById("start-overlay");

/**********************************************
 * 1) Create a <video> element for each file
 *    Preload it fully (canplaythrough).
 **********************************************/
function preloadAllVideos() {
  videoList.forEach((src, i) => {
    // Create the <video> element
    const vid = document.createElement("video");
    vid.src = src;
    vid.preload = "auto";
    vid.muted = true; // iOS requires muted for inline
    vid.playsInline = true;
    vid.webkitPlaysinline = true;
    vid.loop = (i === 0); // first video loops, others do not

    // styling to fill container (handled by CSS)
    vid.style.width = "100%";
    vid.style.height = "100%";

    // Start at opacity 0, only the active one gets .active
    vid.classList.add("video-item"); // optional class if you want
    // We'll add .active to the first one once user taps

    // Wait for canplaythrough => fully buffered for smooth playback
    vid.addEventListener("canplaythrough", () => {
      videosLoadedCount++;
      console.log(`Video ${i} loaded: ${src}`);
      checkAllLoaded();
    });

    // Add to container, but they start hidden
    videoContainer.appendChild(vid);
    allVideos.push(vid);
  });
}

/**********************************************
 * 2) Check if all are loaded => remove loading screen
 **********************************************/
function checkAllLoaded() {
  if (videosLoadedCount === videoList.length) {
    // All videos are fully loaded
    loadingScreen.style.display = "none"; 
    // show the start overlay
    startOverlay.classList.remove("hidden");
  }
}

/**********************************************
 * 3) Crossfade to the next video
 **********************************************/
function goToVideo(index) {
  // If index is out of range, wrap around
  const newIndex = index % allVideos.length;

  // The old active video
  const oldVid = allVideos[currentIndex];
  // The new video
  const newVid = allVideos[newIndex];

  // Make sure the new video is at time=0 (or near it)
  newVid.currentTime = 0;
  
  // oldVid fades out (remove .active => opacity:0), newVid fades in (add .active => opacity:1)
  oldVid.classList.remove("active");
  newVid.classList.add("active");

  // For the new one, .play() it
  newVid.play().catch(err => {
    console.warn("Play error on new video:", err);
  });

  // Pause the old one (just in case)
  oldVid.pause();

  // Update the global currentIndex
  currentIndex = newIndex;
}

/**********************************************
 * 4) Handle user taps
 **********************************************/
function onTap() {
  if (!isAppStarted) {
    // First tap => start the first video
    isAppStarted = true;
    startOverlay.classList.add("hidden");

    // Mark the first video as .active
    const firstVid = allVideos[0];
    firstVid.classList.add("active");
    // Start playing the first video
    firstVid.play().catch(err => {
      console.warn("Play error on first video:", err);
    });
  } else {
    // Next taps => go to next video
    goToVideo(currentIndex + 1);
  }
}

/**********************************************
 * 5) Set up event listeners for taps
 **********************************************/
function setupTapEvents() {
  // We listen on the entire document body, for iOS reliability
  document.body.addEventListener("click", onTap);
  document.body.addEventListener("touchstart", onTap);
}

/**********************************************
 * 6) Main init
 **********************************************/
function init() {
  // Create & preload all <video> elements
  preloadAllVideos();
  // Setup tap events
  setupTapEvents();
}

// Start the app
init();
