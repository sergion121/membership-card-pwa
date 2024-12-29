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
    
    // Bind methods
    this.onTap = this.onTap.bind(this);
    this.handleVideoEnd = this.handleVideoEnd.bind(this);
  }

  async init() {
    try {
      // Check if running on iOS
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      // Update loading text to show progress
      this.loadingText.textContent = "Preparing videos...";
      
      await this.preloadVideos();
      this.setupEventListeners();
      
      // Show start overlay
      this.loadingScreen.style.display = "none";
      this.startOverlay.classList.remove("hidden");
      
      // Pre-load first video for iOS
      if (this.isIOS) {
        const firstVideo = this.videos[0];
        firstVideo.load();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      this.loadingText.textContent = "Error loading videos. Please refresh.";
    }
  }

  async preloadVideos() {
    const loadPromises = videoList.map((src, index) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        
        // Set video properties
        Object.assign(video, {
          src,
          preload: "auto",
          muted: true,
          playsInline: true,
          playsinline: true, // iOS specific
          'webkit-playsinline': true, // iOS specific
          controls: false,
          loop: false,
          defaultMuted: true // iOS specific
        });

        // Set styles
        Object.assign(video.style, {
          width: "100%",
          height: "100%",
          opacity: "0",
          position: "absolute",
          top: "0",
          left: "0",
          objectFit: "cover"
        });

        // iOS specific event listeners
        if (this.isIOS) {
          video.addEventListener('loadedmetadata', () => {
            video.load(); // Force load on iOS
            resolve(video);
          }, { once: true });
        } else {
          video.addEventListener("canplaythrough", () => resolve(video), { once: true });
        }

        video.addEventListener("error", (e) => {
          console.error(`Error loading video ${index}:`, e);
          reject(e);
        });
        
        // Start loading
        this.videoContainer.appendChild(video);
        this.videos.push(video);
        
        // Force load for iOS
        if (this.isIOS) {
          video.load();
        }
      });
    });

    // Wait for all videos to load with timeout
    try {
      await Promise.race([
        Promise.all(loadPromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Loading timeout')), 30000))
      ]);
    } catch (error) {
      console.error('Video loading error or timeout:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Remove any existing listeners
    document.body.removeEventListener("click", this.onTap);
    document.body.removeEventListener("touchstart", this.onTap);
    
    // Add new listeners
    document.body.addEventListener("click", this.onTap, { passive: false });
    document.body.addEventListener("touchstart", this.onTap, { passive: false });
    
    // Add ended event listeners
    this.videos.forEach((video, index) => {
      if (index < this.videos.length - 1) {
        video.addEventListener("ended", () => this.handleVideoEnd(index));
      }
    });
  }

  async transitionToVideo(newIndex) {
    if (newIndex >= this.videos.length) return;

    const currentVideo = this.videos[this.currentIndex];
    const nextVideo = this.videos[newIndex];

    // Prepare next video
    try {
      nextVideo.currentTime = 0;
      
      // iOS specific handling
      if (this.isIOS) {
        await nextVideo.load();
      }
      
      // Start playing next video
      const playPromise = nextVideo.play();
      if (playPromise !== undefined) {
        await playPromise;
        
        // Crossfade videos
        requestAnimationFrame(() => {
          nextVideo.style.opacity = "1";
          currentVideo.style.opacity = "0";
        });

        // Update current index
        this.currentIndex = newIndex;

        // Stop previous video after fade
        setTimeout(() => {
          currentVideo.pause();
          if (this.isIOS) {
            currentVideo.currentTime = 0;
          }
        }, 800);
      }
    } catch (error) {
      console.error("Error during transition:", error);
      this.loadingText.textContent = "Playback error. Please refresh.";
    }
  }

  handleVideoEnd(index) {
    if (index < this.videos.length - 1) {
      this.transitionToVideo(index + 1);
    }
  }

  async onTap(event) {
    // Prevent default behavior
    event.preventDefault();
    
    try {
      if (!this.isAppStarted) {
        this.isAppStarted = true;
        this.startOverlay.classList.add("hidden");
        
        // Start first video
        const firstVideo = this.videos[0];
        
        // iOS specific handling
        if (this.isIOS) {
          await firstVideo.load();
        }
        
        firstVideo.style.opacity = "1";
        await firstVideo.play();
      } else if (this.currentIndex < this.videos.length - 1) {
        await this.transitionToVideo(this.currentIndex + 1);
      }
    } catch (error) {
      console.error("Playback error:", error);
      this.loadingText.textContent = "Playback error. Please refresh.";
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