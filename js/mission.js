var all_missions = [];
var all_ai_cards = [];
var missions = [];

const mission_base_path = "images\\missions\\";
const ai_base_path = "images\\ai\\";
const attention_base_path = "images\\attenion\\";
const ai_file_front_prefix = "Imperial Assault - RAIVER - AI - Front";
const ai_file_back_prefix = "Imperial Assault - RAIVER - AI - Back";

const missionSearchSelect = document.getElementById("missionSearch");
const aiSearchSelect = document.getElementById("aiSearch");

const missionCardDiv = document.getElementById("missionCard");
const aiCardDiv = document.getElementById("aiCard");

const collectionWaveBody = document.getElementById("collectionWaveBody");
const checkboxes = document.getElementsByClassName("form-check-input");

const loadMissionData = async () => {
    const res = await fetch('data/missions.json');
    all_missions = await res.json();

    const res2 = await fetch('data/ai.json');
    all_ai_cards = await res2.json();
};

$(document).ready(function () {
    loadMissionData();

    $('body').on('click', '#missionCard img', function () {
        let imgSrc = this.src;
        if (imgSrc.includes("Mission%20Objectives"))
            this.src = imgSrc.replace("Mission%20Objectives", "Events");
        else
            this.src = imgSrc.replace("Events", "Mission%20Objectives");
    })

    $('body').on('click', '#aiCard img', function () {

        if (this.classList.contains("selected"))
            this.classList.remove("selected")
        else
            this.classList.add("selected")

        var selectedCards = document.getElementsByClassName("selected");

        if (selectedCards.length === 0)
            removeBtn.disabled = true;
        else
            removeBtn.disabled = false;
    })
});

$('#missionSearch').on('select2:select', function (e) {
    var data = e.params.data;

    let img = document.createElement("img");
    img.src = getImagePath(data, true);
    img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");

    missionCard.innerHTML = '';
    missionCard.appendChild(img);
});

function loadAll() {
    missions = all_missions.slice();
    updateMissionDropDown();
    updateAICardDropDown();
}

function loadCollection(input) {
    //read collection
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
        let collectionByName = JSON.parse(reader.result);

        all_missions.forEach(function (mission) {
            if (collectionByName.includes(mission.collection)) {
                missions.push(mission);
            }
        })
        updateMissionDropDown();
    };

    reader.onerror = function () {
        console.log(reader.error);
    };
}

function rollD6() {
    let r = Math.floor(Math.random() * 6) + 1;
    rollD6Btn.innerText = "Roll D6 [" + r + "]";
}

function add() {
    var data = $('#aiSearch').select2('data');

    //add front
    let img = document.createElement("img");
    img.src = ai_base_path + ai_file_front_prefix + data[0].fid + ".jpg";
    img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
    img.alt = data[0].fid;
    aiCard.appendChild(img);

    //add back
    img = document.createElement("img");
    img.src = ai_base_path + ai_file_back_prefix + data[0].fid + ".jpg";
    img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
    img.alt = data[0].fid;
    aiCard.appendChild(img);
}

function remove() {
    //get all the displayed card
    var getDivId = document.getElementById("aiCard");
    var allDisplayedAICards = getDivId.getElementsByTagName("img");
    //convert to array
    allDisplayedAICards = [].slice.call(allDisplayedAICards);

    //get all the selected cart
    var selectedCards = document.getElementsByClassName("selected");
    selectedCards = [].slice.call(selectedCards);

    //extract all the alt attribute from the img tag
    let delete_fileIndex = new Set();
    selectedCards.forEach(function (card) {
        delete_fileIndex.add(card.alt);
    })

    console.log(delete_fileIndex);

    //loop through all displayed card and remove card that has matching fileIndex
    allDisplayedAICards.forEach(function (card) {
        for (let index of delete_fileIndex) {
            if (index == card.alt)
                card.parentNode.removeChild(card);
        }

    })

    removeBtn.disabled = true;
}

function updateMissionDropDown() {
    var data = $.map(missions, function (obj) {
        obj.text = obj.name + " (" + obj.collection + ")";
        obj.id = obj.name;
        return obj;
    });

    $("#missionSearch").select2({
        data: data
    })

    missionSearchSelect.disabled = false;
    selectMissionLabel.innerText = "Select Mission: (Available Missions = " + missions.length + ")";
}

function updateAICardDropDown() {
    var data = $.map(all_ai_cards, function (obj) {
        obj.text = obj.name;
        obj.id = obj.name;
        return obj;
    });

    data.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    $("#aiSearch").select2({
        data: data
    })

    addBtn.disabled = false;
    aiSearchSelect.disabled = false;
    selectAICardLabel.innerText = "Select AI Card: (Avaliable AI Cards = " + all_ai_cards.length + ")";
}

function selectAll(bool) {
    if (bool) {
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = true;
        }
    }
    else {
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = false;
        }
    }
}

function saveCollection() {
    let collection = [];
    collection.push("Core");
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            collection.push(checkboxes[i].value);
        }
    }

    var content = JSON.stringify(collection, null, 2);
    var blob = new Blob([content], {
        type: "text/plain;charset=utf-16"
    });
    saveAs(blob, "collections.json");
}

function createCollection() {

    var waves = all_missions.filter(function (mission) {
        return mission.hasOwnProperty("wave");
    });

    waves.sort((a, b) => (a.collection > b.collection) ? 1 : ((b.collection > a.collection) ? -1 : 0));

    waves.forEach((item) => {
        let div = document.createElement("div");
        div.classList.add("form-check");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("form-check-input");
        input.value = item.collection;
        let label = document.createElement("label");
        label.classList.add("form-check-label");
        label.innerText = item.collection;
        div.appendChild(input);
        div.appendChild(label);
        collectionWaveBody.appendChild(div);
    })
}

function getImagePath(mission, front) {
    if (mission.hasOwnProperty("wave")) {
        img_path = mission_base_path + "Wave\\Missions - " + mission.wave + " - ";
        if (front)
            return img_path.concat("Mission Objectives" + mission.fid + ".jpg");
        else
            return img_path.concat("Events" + mission.fid + ".jpg");
    } else {
        img_path = mission_base_path + mission.collection + "\\Missions - " + mission.collection + " - ";
        if (front)
            return img_path.concat("Mission Objectives" + mission.fid + ".jpg");
        else
            return img_path.concat("Events" + mission.fid + ".jpg");
    }
}

function toogleAttention() {
    if (attentionBtn.innerText == "Enable Attention Card") {
        console.log(attentionBtn.innerText);
        let e = document.getElementById("attentionArea");
        e.classList.add("boarder");

        let h5 = document.createElement("h5");
        h5.innerHTML = "Minimum Hero XP";
        let select = document.createElement("select");
        select.classList.add("selectpicker");
        select.id = "attentionDropDown";
        select.onchange = function () { addAttentionCard(); };

        let op0 = document.createElement("option");
        op0.value = "0";
        op0.textContent = "0";
        let op1 = document.createElement("option");
        op1.value = "1";
        op1.textContent = "1+";
        let op3 = document.createElement("option");
        op3.value = "3";
        op3.textContent = "3+";
        let op6 = document.createElement("option");
        op6.value = "6";
        op6.textContent = "6+";
        let op10 = document.createElement("option");
        op10.value = "10";
        op10.textContent = "10+";

        select.appendChild(op0);
        select.appendChild(op1);
        select.appendChild(op3);
        select.appendChild(op6);
        select.appendChild(op10);

        let div = document.createElement("div");
        div.classList.add("d-flex", "flex-wrap");
        div.style.marginTop = "10px"
        div.id = "attentionCard"

        attentionArea.appendChild(h5);
        attentionArea.appendChild(select);
        attentionArea.appendChild(div);
        attentionBtn.innerText = "Disable Attention Card"
    } else {
        let e = document.getElementById("attentionArea");
        e.classList.remove("boarder");
        attentionArea.innerHTML = '';
        attentionBtn.innerText = "Enable Attention Card"
    }
}

function addAttentionCard() {
    attentionCard.innerHTML = '';
    let img
    switch ($("#attentionDropDown").val()) {
        case "10":
            console.log("test");
            img = document.createElement("img");
            img.src = "images\\attention\\Attention Card4.jpg"
            img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
            attentionCard.appendChild(img);
        case "6":
            img = document.createElement("img");
            img.src = "images\\attention\\Attention Card3.jpg"
            img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
            attentionCard.appendChild(img);
        case "3":
            img = document.createElement("img");
            img.src = "images\\attention\\Attention Card2.jpg"
            img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
            attentionCard.appendChild(img);
        case "1":
            img = document.createElement("img");
            img.src = "images\\attention\\Attention Card1.jpg"
            img.classList.add("animated", "flipInY", "mx-auto", "d-block", "card");
            attentionCard.appendChild(img);
        default:
    }

}

function disableAttention() {
    let e = document.getElementById("attentionArea");
    e.classList.remove("boarder");
    attentionArea.innerHTML = '';
}