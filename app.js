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
    this.videos = [];
    this.isAppStarted = false;
    this.tapCount = 0;
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
      
      // Pre-buffer all videos
      for (const video of this.videos) {
        await this.prepareVideo(video);
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
        
        video.innerHTML = `<source src="${src}" type="video/mp4">`;
        
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
    document.body.removeEventListener("click", this.onTap);
    document.body.removeEventListener("touchstart", this.onTap);
    
    document.body.addEventListener("click", this.onTap, { passive: false });
    document.body.addEventListener("touchstart", this.onTap, { passive: false });
  }

  async playVideo(index) {
    // Hide all videos
    this.videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
      v.style.opacity = "0";
    });

    const videoToPlay = this.videos[index];
    videoToPlay.currentTime = 0;
    await this.prepareVideo(videoToPlay);
    await videoToPlay.play();
    videoToPlay.style.opacity = "1";
  }

  async onTap(event) {
    event.preventDefault();
    
    try {
      if (!this.isAppStarted) {
        // First tap - start app and play first video
        this.isAppStarted = true;
        this.startOverlay.classList.add("hidden");
        this.tapCount = 1;
        await this.playVideo(0);
      } else {
        // Increment tap count
        this.tapCount++;
        
        // Calculate which video to play (1-based counting for tapCount)
        const videoIndex = ((this.tapCount - 1) % this.videos.length);
        await this.playVideo(videoIndex);
      }
    } catch (error) {
      console.error("Playback error:", error);
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