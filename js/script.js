console.log("Let's Write Javascript");

let currentSong = new Audio();
let songs = [];
let currentIndex = 0;
let CurrFolder;

// ===== AUTH STATE =====
let currentUser = null;
const USERS_KEY = 'spotify_users';
const SESSION_KEY = 'spotify_session';

// Load session
function loadSession() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
        currentUser = JSON.parse(saved);
        updateUIForAuth();
    }
}

// Save session
function saveSession(user) {
    currentUser = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    updateUIForAuth();
}

// Clear session
function clearSession() {
    currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    updateUIForAuth();
}

// Get users from localStorage
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ===== UI UPDATE =====
function updateUIForAuth() {
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');
    const profileSection = document.getElementById('profileSection');
    const avatarInitials = document.getElementById('avatarInitials');

    if (currentUser) {
        signupBtn.style.display = 'none';
        loginBtn.style.display = 'none';
        profileSection.style.display = 'flex';
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarInitials.textContent = initials;
    } else {
        signupBtn.style.display = 'inline-block';
        loginBtn.style.display = 'inline-block';
        profileSection.style.display = 'none';
    }
}

// ===== POPUP =====
function showPopup(message, isError = false) {
    const popup = document.getElementById('popupMessage');
    popup.textContent = message;
    popup.className = 'popup-message' + (isError ? ' error' : '');
    popup.classList.add('show');
    clearTimeout(popup._timer);
    popup._timer = setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

// ===== AUTH MODAL =====
const authModal = document.getElementById('authModal');
const authClose = document.getElementById('authClose');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleLink = document.getElementById('authToggleLink');
const authToggleText = document.getElementById('authToggleText');
const nameField = document.getElementById('nameField');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authForm = document.getElementById('authForm');

let isLoginMode = false;

function openAuthModal(login = false) {
    isLoginMode = login;
    if (login) {
        authTitle.textContent = 'Log In';
        authSubmitBtn.textContent = 'Log In';
        authToggleText.textContent = "Don't have an account?";
        authToggleLink.textContent = 'Sign Up';
        nameField.style.display = 'none';
    } else {
        authTitle.textContent = 'Sign Up';
        authSubmitBtn.textContent = 'Sign Up';
        authToggleText.textContent = 'Already have an account?';
        authToggleLink.textContent = 'Log In';
        nameField.style.display = 'block';
    }
    authModal.classList.add('active');
    authForm.reset();
}

function closeAuthModal() {
    authModal.classList.remove('active');
}

authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal(!isLoginMode);
});

authClose.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
});

// ===== PROFILE MODAL =====
const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePassword = document.getElementById('profilePassword');
const profileSaveBtn = document.getElementById('profileSaveBtn');
const profileMessage = document.getElementById('profileMessage');

document.getElementById('profileAvatar').addEventListener('click', () => {
    if (!currentUser) return;
    profileName.value = currentUser.name;
    profileEmail.value = currentUser.email;
    profilePassword.value = '';
    profileMessage.textContent = '';
    profileMessage.className = 'profile-message';
    profileModal.classList.add('active');
});

profileClose.addEventListener('click', () => {
    profileModal.classList.remove('active');
});
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.classList.remove('active');
});

profileSaveBtn.addEventListener('click', () => {
    const newName = profileName.value.trim();
    const newPassword = profilePassword.value.trim();
    if (!newName) {
        profileMessage.textContent = 'Name cannot be empty';
        profileMessage.className = 'profile-message error';
        return;
    }
    const users = getUsers();
    const userEmail = currentUser.email;
    if (users[userEmail]) {
        users[userEmail].name = newName;
        if (newPassword.length >= 6) {
            users[userEmail].password = newPassword;
        } else if (newPassword.length > 0 && newPassword.length < 6) {
            profileMessage.textContent = 'Password must be at least 6 characters';
            profileMessage.className = 'profile-message error';
            return;
        }
        saveUsers(users);
        currentUser = users[userEmail];
        saveSession(currentUser);
        const avatarInitials = document.getElementById('avatarInitials');
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarInitials.textContent = initials;
        profileName.value = currentUser.name;
        profileEmail.value = currentUser.email;
        profilePassword.value = '';
        profileMessage.textContent = 'Profile updated successfully!';
        profileMessage.className = 'profile-message';
        showPopup('Profile updated successfully!');
    } else {
        profileMessage.textContent = 'User not found';
        profileMessage.className = 'profile-message error';
    }
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    const name = authName.value.trim();

    if (!email || !password) {
        showPopup('Please fill all fields', true);
        return;
    }
    if (password.length < 6) {
        showPopup('Password must be at least 6 characters', true);
        return;
    }

    const users = getUsers();

    if (isLoginMode) {
        if (users[email] && users[email].password === password) {
            saveSession(users[email]);
            closeAuthModal();
            showPopup('Welcome back, ' + users[email].name + '!');
        } else {
            showPopup('Invalid email or password', true);
        }
    } else {
        if (users[email]) {
            showPopup('Email already registered. Please log in.', true);
            return;
        }
        if (!name) {
            showPopup('Please enter your name', true);
            return;
        }
        const newUser = { name, email, password };
        users[email] = newUser;
        saveUsers(users);
        saveSession(newUser);
        closeAuthModal();
        showPopup('You Registered Successfully! 🎉');
    }
});

document.getElementById('signupBtn').addEventListener('click', () => openAuthModal(false));
document.getElementById('loginBtn').addEventListener('click', () => openAuthModal(true));

document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    showPopup('Logged out successfully');
    currentSong.pause();
    currentSong.src = '';
    document.getElementById('play').src = '/images/play.svg';
    document.querySelector('.songinfo').innerHTML = 'Select a song';
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
});

function requireAuth() {
    if (currentUser) return true;
    openAuthModal(false);
    showPopup('Please sign up or log in to play music', true);
    return false;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    CurrFolder = folder;
    const a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    const response = await a.text();
    const div = document.createElement('div');
    div.innerHTML = response;
    const as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        const li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="" />
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Zain Ul Abidin</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="/images/play.svg" alt="" />
            </div>
        `;
        songUL.appendChild(li);
    }
}

function playMusic(track, pause = false) {
    currentSong.src = `/${CurrFolder}/` + track;
    if (!pause) {
        currentSong.play();
       document.getElementById('play').src =   '/images/pause.svg';
    }
    document.querySelector('.songinfo').innerHTML = track.replaceAll('%20', ' ');
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
    currentIndex = songs.indexOf(track);
    // Highlight active
    document.querySelectorAll('.songList ul li').forEach((li) => {
        const infoDiv = li.querySelector('.info');
        if (infoDiv) {
            const liTrack = infoDiv.firstElementChild?.innerHTML?.trim() || '';
            if (liTrack === track.replaceAll('%20', ' ')) {
                li.style.borderColor = '#1DB954';
                li.style.background = '#1f1f1f';
            } else {
                li.style.borderColor = '#fff';
                li.style.background = 'transparent';
            }
        }
    });
}



async function main() {
    loadSession();


    // Default to 'ncs' folder
    await getSongs('songs/AtifAslam');
    if (songs.length === 0) return;
    playMusic(songs[0], true);

    

    // ===== EVENT DELEGATION FOR SONG LIST (FIX) =====
    document.querySelector('.songList ul').addEventListener('click', function(e) {
        const li = e.target.closest('li');
        if (!li) return;
        if (!requireAuth()) return;
        const track = li.querySelector('.info')?.firstElementChild?.innerHTML?.trim();
        if (track) {
            playMusic(track);
        }
    });

    // ===== CARD CLICK HANDLER =====
    document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('click', async function (e) {
            if (!requireAuth()) return;
            const folder = this.dataset.folder;
            if (!folder) return;
            await getSongs(`songs/${folder}`);
            if (songs.length > 0) {
                playMusic(songs[0]);
                document.querySelectorAll('.card').forEach(c => c.style.border = 'none');
                this.style.border = '2px solid #1DB954';
            } else {
                showPopup('No songs found in this folder', true);
            }
        });
    });

    // Play/Pause
    const playBtn = document.getElementById('play');
    playBtn.addEventListener('click', () => {
        if (!currentUser) {
            requireAuth();
            return;
        }
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = '/images/pause.svg';
        } else {
            currentSong.pause();
            playBtn.src = '/images/play.svg';
        }
    });

    // Previous
    document.getElementById('previous').addEventListener('click', () => {
        if (!currentUser) { requireAuth(); return; }
        if (songs.length === 0) return;
        let idx = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[idx]);
    });

    // Next
    document.getElementById('next').addEventListener('click', () => {
        if (!currentUser) { requireAuth(); return; }
        if (songs.length === 0) return;
        let idx = (currentIndex + 1) % songs.length;
        playMusic(songs[idx]);
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Seekbar click
    const seekbar = document.getElementById('seekbar');
    seekbar.addEventListener('click', (e) => {
        if (!currentUser) { requireAuth(); return; }
        const rect = seekbar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // ===== RESPONSIVE SIDEBAR TOGGLE =====
    const hamburger = document.getElementById("hamburgerBtn");
    const leftSidebar = document.getElementById("leftSidebar");
    const overlay = document.getElementById("overlay");

    function toggleSidebar(show) {
        if (show === undefined) {
            leftSidebar.classList.toggle("open");
        } else if (show) {
            leftSidebar.classList.add("open");
        } else {
            leftSidebar.classList.remove("open");
        }
        overlay.classList.toggle("active", leftSidebar.classList.contains("open"));
    }

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
    document.getElementById("closeSidebarBtn").addEventListener("click", function() {
        toggleSidebar(false);
    });
    overlay.addEventListener("click", () => {
        toggleSidebar(false);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            toggleSidebar(false);
        }
    });

    // Volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Volume Setting to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Mute toggle
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();