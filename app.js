/**********************************************
 * Config: List your video files here
 **********************************************/
const videoList = [
  "Part_01_edited_v3.mp4",
  "STUK_Flipping__Sequence(Prolonged backside)_v5.mp4",
  "STUK_Flipping_back__Sequence(Prolonged)_v2.mp4"
];

/**********************************************
 * Video Player Implementation
 **********************************************/
class VideoPlayer {
  constructor() {
    this.currentIndex = 0;
    this.videos = [];
    this.isAppStarted = false;
    this.loadingScreen = document.getElementById("loading-screen");
    this.videoContainer = document.getElementById("video-container");
    this.startOverlay = document.getElementById("start-overlay");
    this.loadingText = document.querySelector(".loading-text");
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Bind methods
    this.onTap = this.onTap.bind(this);
  }

  async init() {
    try {
      this.loadingText.textContent = "Preparing videos...";
      await this.preloadVideos();
      this.setupEventListeners();
      
      // Pre-buffer the first two videos
      if (this.videos[0]) {
        await this.prepareVideo(this.videos[0]);
        if (this.videos[1]) {
          await this.prepareVideo(this.videos[1]);
        }
      }
      
      this.loadingScreen.style.display = "none";
      this.startOverlay.classList.remove("hidden");
    } catch (error) {
      console.error("Initialization error:", error);
      this.loadingText.textContent = "Error loading videos. Please refresh.";
    }
  }

  async prepareVideo(video) {
    try {
      video.currentTime = 0;
      await video.load();
      
      // On iOS, we need to start and immediately pause to prepare the video
      if (this.isIOS) {
        await video.play();
        video.pause();
        video.currentTime = 0;
      }
    } catch (error) {
      console.error("Error preparing video:", error);
    }
  }

  async preloadVideos() {
    const loadPromises = videoList.map((src, index) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        
        // Set source
        video.innerHTML = `<source src="${src}" type="video/mp4">`;
        
        // Set video properties
        Object.assign(video, {
          preload: "auto",
          muted: true,
          playsInline: true,
          playsinline: true,
          'webkit-playsinline': true,
          controls: false,
          loop: false,
          defaultMuted: true
        });

        // Set styles
        Object.assign(video.style, {
          width: "100%",
          height: "100%",
          opacity: "0",
          position: "absolute",
          top: "0",
          left: "0",
          objectFit: "cover",
          transition: "opacity 0.3s ease-out"
        });

        // Event listeners
        video.addEventListener('loadedmetadata', () => {
          resolve(video);
        }, { once: true });

        video.addEventListener("error", (e) => {
          console.error(`Error loading video ${index}:`, e);
          reject(e);
        });
        
        this.videoContainer.appendChild(video);
        this.videos.push(video);
      });
    });

    await Promise.all(loadPromises);
  }

  setupEventListeners() {
    // Remove any existing listeners first
    document.body.removeEventListener("click", this.onTap);
    document.body.removeEventListener("touchstart", this.onTap);
    
    // Add listeners
    document.body.addEventListener("click", this.onTap, { passive: false });
    document.body.addEventListener("touchstart", this.onTap, { passive: false });
  }

  async transitionToVideo(newIndex) {
    // Use modulo to wrap around to the beginning
    const nextIndex = newIndex % this.videos.length;
    const currentVideo = this.videos[this.currentIndex];
    const nextVideo = this.videos[nextIndex];

    try {
      // Prepare next video
      nextVideo.currentTime = 0;
      
      // Start playing next video while still invisible
      const playPromise = nextVideo.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        
        // Fade transition
        requestAnimationFrame(() => {
          nextVideo.style.opacity = "1";
          currentVideo.style.opacity = "0";
        });

        // Update current index
        this.currentIndex = nextIndex;
        
        // Clean up current video and prepare next in sequence
        setTimeout(() => {
          currentVideo.pause();
          currentVideo.currentTime = 0;
          
          // Pre-buffer next video in sequence
          const upcomingIndex = (nextIndex + 1) % this.videos.length;
          this.prepareVideo(this.videos[upcomingIndex]);
        }, 300);
      }
    } catch (error) {
      console.error("Transition error:", error);
      // Attempt recovery
      this.currentIndex = nextIndex;
    }
  }

  async onTap(event) {
    event.preventDefault();
    
    try {
      if (!this.isAppStarted) {
        // First tap - start playing
        this.isAppStarted = true;
        this.startOverlay.classList.add("hidden");
        
        const firstVideo = this.videos[0];
        firstVideo.style.opacity = "1";
        await firstVideo.play();
      } else {
        // Subsequent taps - go to next video
        await this.transitionToVideo(this.currentIndex + 1);
      }
    } catch (error) {
      console.error("Playback error:", error);
      // Attempt recovery by reinitializing if needed
      if (!this.isAppStarted) {
        this.init();
      }
    }
  }
}

/**********************************************
 * Initialize the player
 **********************************************/
document.addEventListener('DOMContentLoaded', () => {
  const player = new VideoPlayer();
  player.init().catch(error => {
    console.error("Player initialization error:", error);
    document.querySelector(".loading-text").textContent = "Error initializing player. Please refresh.";
  });
});