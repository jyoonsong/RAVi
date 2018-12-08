let isRecording = false;
let chatTabId = 0;
let startTime = 0;

chrome.browserAction.onClicked.addListener(function(t) {

    console.log("chrome.browserAction.onClicked " + isRecording);

    if (t.url.includes("hangouts.google.com/call")) {

        // open up tab
        if (!isRecording) {
            chatTabId = t.id;

            localStorage.clear();
            chrome.tabs.create({
                "url": "https://VideoMagic.github.io"
            }, function(tab) {
                isRecording = true;
            });
        }
        else {
            if (confirm('회의를 종료하셨으면 [확인], 단순 새로고침하신 거면 [취소]를 눌러주세요')) {
                // Save json
                chrome.tabs.sendMessage(t.id, {msg: "save"});
            }
            else {
                // Restart it
                chrome.tabs.sendMessage(t.id, {msg: "buttons", startTime: data.start});
            }
        }

    }
    else {
        alert("RAVi only works with Google Hangouts!");
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if (isRecording && changeInfo.status == "complete") {

        let url = tab.url;

        console.log(tab);

        if (!url) {
            console.log("complete but no url")
            return;
        }
        else if (url.toLowerCase().includes("videomagic")) {
            chrome.tabs.sendMessage(tabId, {msg: "record"});
        }

    }
    
});

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    
    console.log("background received: ");
    console.log(data);

    if (data.start) {
        // get ready for the buttons

        chrome.tabs.update(chatTabId, { highlighted: true }, function(tab) {
            chrome.tabs.sendMessage(chatTabId, {msg: "buttons", startTime: data.start});
        });
    }
    
});
