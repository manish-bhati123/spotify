const barcard = document.querySelectorAll(".card");
const songs = {
    bad: [
        "http://127.0.0.1:5500/songs/Bad/manish1.mp3",
        "http://127.0.0.1:5500/songs/Bad/manish2.mp3",
        "http://127.0.0.1:5500/songs/Bad/manish3.mp3",
        "http://127.0.0.1:5500/songs/Bad/manish4.mp3",
        "http://127.0.0.1:5500/songs/Bad/manish5.mp3"
    ],
    hani: [
        "http://127.0.0.1:5500/songs/hani/bhati1.mp3",
        "http://127.0.0.1:5500/songs/hani/bhati2.mp3",
        "http://127.0.0.1:5500/songs/hani/bhati3.mp3",
        "http://127.0.0.1:5500/songs/hani/bhati4.mp3",
        "http://127.0.0.1:5500/songs/hani/bhati5.mp3"
    ]
};

let currentAudio = null;
let currentSongIndex = null;
let currentFolder = null; // Track the selected folder (hani or bad)

async function main() {
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    barcard.forEach(card => {
        card.addEventListener('click', () => {
            const folder = card.getAttribute('data-folder');  // Get the folder (bad or hani) from the clicked card
            currentFolder = folder;  // Set the current folder
            showSongsAndPlay(folder);  // Show songs for the selected folder
        });
    });

    const playPauseButton = document.querySelector(".controls .play-btns");
    const forwardBtn = document.querySelector('.forword-btn');
    const backwardBtn = document.querySelector('.backword-btn');

    playPauseButton.addEventListener("click", () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                togglePlayPauseButton(false); // Show pause button when playing
            } else {
                currentAudio.pause();
                togglePlayPauseButton(true); // Show play button when paused
            }
        }
    });

    forwardBtn.addEventListener('click', () => {
        if (currentFolder) {
            let allSongs = songs[currentFolder]; // Get the songs of the selected folder
            if (currentSongIndex < allSongs.length - 1) {
                currentSongIndex++;
            } else {
                currentSongIndex = 0; // Loop back to the first song
            }
            playSongAtIndex(currentSongIndex); // Play the song at the updated index
        }
    });

    backwardBtn.addEventListener('click', () => {
        if (currentFolder) {
            let allSongs = songs[currentFolder]; // Get the songs of the selected folder
            if (currentSongIndex > 0) {
                currentSongIndex--;
            } else {
                currentSongIndex = allSongs.length - 1; // Loop back to the last song
            }
            playSongAtIndex(currentSongIndex); // Play the song at the updated index
        }
    });

    // Volume control
    const volumeSlider = document.querySelector("#dol");
    const volumeIcon = document.querySelector("#bol");

    if (currentAudio) {
        currentAudio.volume = volumeSlider.value / 100;
    }

    volumeSlider.addEventListener("input", (e) => {
        if (currentAudio) {
            currentAudio.volume = e.target.value / 100;
        }

        // Update the volume icon based on the volume
        if (e.target.value == 0) {
            volumeIcon.src = "mute.svg";  // Mute icon
        } else if (e.target.value < 50) {
            volumeIcon.src = "low-volume.svg";  // Low volume icon
        } else {
            volumeIcon.src = "high-volume.svg";  // High volume icon
        }
    });
}

// Function to toggle the play/pause button icon
function togglePlayPauseButton(isPaused) {
    const playPauseButton = document.querySelector(".controls .play-btns i");
    if (isPaused) {
        playPauseButton.classList.remove("fa-pause");
        playPauseButton.classList.add("fa-play");
    } else {
        playPauseButton.classList.remove("fa-play");
        playPauseButton.classList.add("fa-pause");
    }
}

// Function to format time (seconds to mm:ss)
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
}

// Function to play song at specific index
function playSongAtIndex(index) {
    if (currentFolder) {
        let allSongs = songs[currentFolder]; // Get the songs from the current folder
        let song = allSongs[index];
        let songName = song.split('/').pop();
        playSong(index, songName, song); // Play the song at the given index
    }
}

// Function to play a song at a given index
function playSong(index, songName, song) {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset current time of the previous song
    }

    var audio = new Audio(song);
    currentAudio = audio;
    currentSongIndex = index;

    // Update song info on UI
    document.querySelector(".songinfo").innerHTML = songName;

    // Play the selected song
    audio.play();

    // Update button and song time display
    togglePlayPauseButton(false);

    audio.addEventListener('loadeddata', () => {
        let duration = formatTime(audio.duration);
        document.querySelector(".songtime").innerHTML = `00:00/${duration}`;
    });

    audio.addEventListener("timeupdate", () => {
        let currentTime = formatTime(audio.currentTime);
        let duration = formatTime(audio.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime}/${duration}`;

        let progress = (audio.currentTime / audio.duration) * 100;
        let circle = document.querySelector(".circle");
        if (circle) {
            circle.style.left = progress + "%";
        }
    });

    // Seekbar click event to update song position
    document.querySelector(".seekbar").addEventListener("click", e => {
        let seekbar = e.target;
        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;

        let progress = (offsetX / rect.width) * 100;
        let circle = document.querySelector(".circle");
        if (circle) {
            circle.style.left = progress + "%";
        }

        // Update audio currentTime based on clicked position
        currentAudio.currentTime = (currentAudio.duration * progress) / 100;
    });

    // When the song ends, automatically skip to the next one
    audio.addEventListener("ended", () => {
        togglePlayPauseButton(true); // Show play button when song ends
        forwardBtn.click(); // Automatically skip to next song
    });
}

// Show songs based on the clicked card (bad or hani)
function showSongsAndPlay(folder) {
    let songListContainer = document.querySelector(".songlist ul");
    songListContainer.innerHTML = ""; // Clear previous songs list

    let songsToDisplay = songs[folder]; // Get songs from the selected folder

    songsToDisplay.forEach((song, index) => {
        let songName = song.split('/').pop(); // Extract song name
        let li = document.createElement('li');

        li.innerHTML = `
            <i class="fa-sharp fa-solid fa-music"></i>
            <div class="add">
                <div>${songName}</div>
                <div>${folder}</div>
            </div>
            <div class="palynow">
                <span>play Now</span>
                <i id="s" class="fa-duotone fa-solid fa-play"></i>
            </div>
        `;

        li.addEventListener('click', () => {
            playSong(index, songName, song);
        });

        songListContainer.appendChild(li);
    });
}

main();


