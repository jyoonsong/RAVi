let isStarted = false;
let allNodes = [];
let targets;
let startTime;
let count = 0;

console.log("content script on");
chrome.runtime.onMessage.addListener(onMessage);

function onMessage(data, sender, response) {
    console.log("message at content script");
    console.log(data);

    if (!data || !screen) {
        alert("ERROR");
        return;
    }

    switch (data.msg) {
        case "record":
            startRecord();
            break;
        case "buttons":
            startTime = data.startTime;
            targets = Array.from( document.querySelectorAll(".NnPBgc .bMHH1c") );
            followChat();
            displayButtons();
            break;
        case "save":
            saveJson();
            break;
    }
    
}

function saveJson() {
    let result = "[" + localStorage.getItem("item" + 0);
    for (let i = 1; i < count; i++) {
        result += ("," + localStorage.getItem("item" + i));
    }
    result += "]";

    var a = document.createElement("a");
    var file = new Blob([result], {type: "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "data.json";
    a.click();
}


function startRecord() {
    // get timer started
    let timer = document.getElementById("timer");

    timer.addEventListener("click", function() {

        if (isStarted) return;

        console.log("clicked");
        isStarted = true;
        chrome.runtime.sendMessage({
            start: parseInt( timer.innerText )
        });

    });
}

function createNode(index) {
    let arr = [];
    let speaker = -1;

    // figure out speaker
    targets.forEach(function(target, i) {
        arr[i] = parseInt( getComputedStyle( target ).opacity );
        console.log(i + "th opacity: " + arr[i]);

        if (speaker < 0 || arr[speaker] < arr[i]) {
            speaker = i; // max opacity
        }
    });

    let now = (new Date()).getTime();
    let start_min = parseInt( ((now - startTime) / 1000) / 60 ); // min
    let start_sec = parseInt( ((now - startTime) / 1000) % 60 ); // sec

    allNodes[index] = {
        start: start_min + ":" + start_sec,
        speaker: targets[speaker].parentElement.previousSibling.innerText,
        end: start_min + ":" + start_sec,
        memo: "This is a default script when there is no speech provided"
    }

    console.log(speaker);
    console.log(allNodes);
}

function followChat() {
    
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    recognition.grammars = speechRecognitionList;

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // start
    recognition.start();
    createNode(0);

    recognition.onresult = function(event) {

        console.log("* recognition result");
        console.log(event.results);

        // update previous node
        let now = (new Date()).getTime();
        let end_min = parseInt( ((now - startTime) / 1000) / 60 ); // min
        let end_sec = parseInt( ((now - startTime) / 1000) % 60 ); // sec

        allNodes[allNodes.length - 1].end = end_min + ":" + end_sec;
        allNodes[allNodes.length - 1].memo = event.results[event.resultIndex][0].transcript + '.';

        // create next node
        createNode(allNodes.length);
        
    }

    recognition.onend = function() {
        // start a new speech recognition again
        recognition.start();
    }

    recognition.onnomatch = function(event) {
        console.log( "No Match" );
    }

    recognition.onerror = function(event) {
        console.log( 'Error occurred in recognition: ' + event.error );
    }

    // var observer = new MutationObserver(function(mutations) {
    //     mutations.forEach(function(mutationRecord) {
    //         mutationRecord.target
    //     });    
    // });

    
    // let targets = Array.from( document.querySelectorAll(".NnPBgc .bMHH1c") );
    // targets.forEach(function(target, i) {
    //     observer.observe(target, { 
    //         attributeFilter : ["class"] 
    //     });
    // });
}

function displayButtons() {
    let screen = document.querySelector(".WOi1Wb");

    // get screen on left corner
    screen.style.width = "72%";
    screen.style.left = "0";

    // create a sidebar with heading and buttons
    let sidebar = document.createElement("div");
    sidebar.setAttribute("id", "ravi");
    document.body.appendChild(sidebar);
    sidebar.innerHTML = `
        <div class='buttons'>
            <div class='btn c0'>Topic Conversion</div>
            <div class='btn c1'>Idea</div>
            <div class='btn c2'>Decision</div>
            <div class='btn c3'>Custom</div>
        </div>`;

    // add style
    let css = `
        #ravi {
            width: 28%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            box-sizing: border-box;
            background: white;
        }
        #ravi .buttons {
            position: absolute;
            left: -140px;
            top: 100px;
            width: 100px;
            z-index: 1000;
        }
        #ravi .buttons .btn {
            width: 90px;
            margin-bottom: 10px;
            padding: 1rem 0;
            border-radius: 3px;
            font-size: .85rem;
            font-weight: 600;
            color: white;
            text-align: center;
        }
        #ravi .buttons .btn:hover {
            cursor: pointer;
        }
        #ravi .c0 {
            background-color: #c92a2a;
        }
        #ravi .c1 {
            background-color: #f59f00;
        }
        #ravi .c2 {
            background-color: #3b5bdb;
        }
        #ravi .c3 {
            background-color: #868e96;
        }
        #ravi .boxes {
            overflow-y: scroll;
            height: 96%;
            padding: 1.5rem;
            box-sizing: border-box;
        }
        #ravi .box {
            border-width: 1px 1px 1px 6px; 
            border-style: solid;
            padding: 1rem;
            margin-bottom: 1rem;
            margin-left: 1.2rem;
            line-height: 1.5;
            position: relative;
        }
        #ravi .b0 {
            border-color: #c92a2a;
        }
        #ravi .b1 {
            border-color: #f59f00;
        }
        #ravi .b2 {
            border-color: #3b5bdb;
        }
        #ravi .b3 {
            border-color: #868e96;
        }
        #ravi .box.b0 {
            margin-left: 0;
        }
        #ravi .box textarea {
            width: calc(100% - 3rem);
            overflow-y: scroll;
            border: 0;
        }
        #ravi .box span.control {
            position: absolute;
            right: 1rem;
            display: inline-block;
        }
        #ravi .box span.control:hover {
            cursor: pointer;
        }
        `,
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    // add container of boxes
    sidebar = sidebar.appendChild( document.createElement('div') );
    sidebar.setAttribute("class", "boxes");
    sidebar.innerHTML = "<h2 style='margin-top: 0'>Summary</h2>";

    // when clicked on the button
    let buttons = Array.from( document.querySelectorAll(".buttons .btn") );
    buttons.forEach(function(ele, i) {
        ele.onclick = function(e) {
            // append a box
            let b = document.createElement('div');
            b.setAttribute("class", "box b" + i);

            let indexOfAll = allNodes.length - 2;
            let type = ele.innerText;
            
            b.setAttribute("indexOfAll", indexOfAll);
            b.innerHTML = contentOf(indexOfAll, type);

            sidebar.appendChild(b);
            b.scrollIntoView(false);

            // store the data in browser
            let selected = allNodes[indexOfAll];
            selected.type = type;
            localStorage.setItem("item" + count, JSON.stringify(selected));

            // add the values
            b.setAttribute("type", type);
            b.setAttribute("indexOfAll", indexOfAll);
            b.setAttribute("cnt", count);

            // add event listeners to controls
            handleEvents(b);
            
            // increase count
            count++;

        }
    });


}


function contentOf(index, type) {
    let ele = allNodes[index];

    return ("<b>" + type + "</b>"
    + " (" + ele.speaker + ")"
    + "<span class='control del'>삭제</span><br>"

    + "<span>" + ele.start + " - " + ele.end + "</span><br>"
    + "<span class='control'><span class='prev'>이전</span> | <span class='forw'>이후</span></span><br>"

    + "<textarea>" + ele.memo + "</textarea>"
    + "<span class='control edit'>수정</span>");
}

function handleEvents(b) {
    b.querySelector(".control.del").addEventListener("click", handleClose);
    b.querySelector(".control .prev").addEventListener("click", handleTime);
    b.querySelector(".control .forw").addEventListener("click", handleTime);
    b.querySelector(".control.edit").addEventListener("click", handleMemo);
}

function handleClose(e) {
    let ele = e.target.parentElement;
    let cnt = parseInt( ele.getAttribute("cnt") );

    console.log(cnt + " deleted");
    localStorage.setItem("item" + cnt, "deleted");
    ele.remove();

    handleEvents(ele);
}
function handleTime(e) {
    let ele = e.target.parentElement.parentElement;

    let cnt = parseInt( ele.getAttribute("cnt") );
    let indexOfAll = parseInt( ele.getAttribute("indexOfAll") );
    let type = ele.getAttribute("type");

    console.log("time called " + indexOfAll + ", " + cnt);

    let newIndex = (e.target.innerText == "이전") ? indexOfAll - 1 : indexOfAll + 1;

    console.log(newIndex + " now shown");

    if (newIndex >= 0 && newIndex < allNodes.length - 1) {

        let selected = allNodes[newIndex];
        selected.type = type;
        localStorage.setItem("item" + cnt, JSON.stringify(selected));

        console.log(selected);
    
        ele.innerHTML = contentOf(newIndex, type);
        ele.setAttribute("indexOfAll", newIndex);
    }

    handleEvents(ele);
}
function handleMemo(e) {
    let ele = e.target.parentElement;
    let cnt = parseInt( ele.getAttribute("cnt") );

    console.log("edit called " + cnt);

    let txt = ele.querySelector("textarea");
    let obj = JSON.parse( localStorage.getItem("item" + cnt) );
    obj.memo = txt.value;
    localStorage.setItem("item" + cnt, JSON.stringify(obj));

    console.log(obj);

    txt.innerText = txt.value;

    handleEvents(ele);

}

