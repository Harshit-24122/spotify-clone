let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for(let i=0; i < as.length; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +  `<li>
                        <img class="invert" src="music2.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20"," ").replaceAll("%2"," ")}</div>
                            <div>Artist</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert small-svg" src="play.svg" alt="">
                        </div>
                    </li>`;
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerText);
            playMusic(e.querySelector(".info").firstElementChild.innerText.trim());
        })
    })
}

const playMusic = (track, pause = false) =>{
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currentFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    console.log(a);
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    console.log(cardContainer);
    console.log(anchors);
    Array.from(anchors).forEach(async e => {
        if(e.href.includes("/songs")){
            // console.log(e.href);
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="folder1" class="card">
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2 class="m5">${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    })
}

async function main(){

    await getSongs("songs/folder1");
    // console.log(songs);
    playMusic(songs[0], true);

    displayAlbums();

    // let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "play.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbar = document.querySelector(".seekbar");
        let rect = seekbar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let width = rect.width;
        let percentage = x / width;
        currentSong.currentTime = percentage * currentSong.duration;
        document.querySelector(".circle").style.left = `${percentage * 100}%`;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".left .close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index-1 >= 0){
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index+1 < songs.length){
            playMusic(songs[index + 1]);
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        let volume = e.target.value;
        currentSong.volume = volume / 100;
        document.querySelector(".volume img").src = "volume.svg";
        if(volume == 0){
            document.querySelector(".volume img").src = "mute.svg";
            // document.querySelector(".volume img").style.width = "25px";
        }
    })

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item=> {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

main();