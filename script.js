const canvas = document.getElementById("dressCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// GLOBAL
// --------------------
const GLOBAL_SCALE = 0.6;
let hoverPreview = null; 

let savedOutfits = JSON.parse(localStorage.getItem("savedOutfits")) || [];

// --------------------
// ASSETS
// --------------------
const assetCategories = [
    "body","eyes","eyeshadow","nose","mouth","brows","blush",
    "hair_front","hair_back","clothes","jackets",
    "hair_accessories","neck_accessories","hands","bkg"
];

const layerOrder = [
    "bkg","hair_back","body","eyeshadow","eyes","nose","mouth",
    "brows","blush","clothes","jackets","neck_accessories",
    "hair_front","hair_accessories","hands"
];

const assetCounts = {
    bkg: 17, body: 2, eyes: 19, eyeshadow: 18, nose: 10,
    mouth: 22, brows: 11, blush: 11, hair_front: 40,
    hair_back: 21, clothes: 165, jackets: 17,
    hair_accessories: 29, neck_accessories: 14,hands: 3
};

const equipped = {
    bkg: 10, body: 2, eyes: 12, eyeshadow: 11, nose: 7,
    mouth: 16, brows: 6, blush: 4, hair_front: 28,
    hair_back: 12, clothes: 149, jackets: 11,
    hair_accessories: 13, neck_accessories: 6,hands:2
};

const displayNames = {
    body: "Body",
    eyes: "Eyes",
    eyeshadow: "Eyeshadow",
    nose: "Nose",
    mouth: "Mouth",
    brows: "Brows",
    blush: "Blush",

    hair_front: "Bangs",
    hair_back: "Hairstyle",
    hair_accessories: "Hair Accessories",
    neck_accessories: "Neckwear",
    hands: "Hands",

    clothes: "Clothes",
    jackets: "Jackets",

    bkg: "Background",

    expressions: "Expressions",
    outfits: "Characters"
};

// --------------------
// COMBOS
// --------------------
const combos = {
    expressions: [
        { name: "Neutral Blue", data: { eyes: 11, eyeshadow: 7, brows: 4, nose: 3, mouth: 18 } },
        { name: "Cool Pink", data: { eyes: 7, eyeshadow: 10, brows: 6, nose: 2, mouth: 3 } },
        { name: "Curious Red", data: { eyes: 5, eyeshadow: 3, brows: 3, nose: 3, mouth: 6} }
    ],
    outfits: [
        { name: "Ivy Princess", data: { bkg: 10, body: 2, eyes: 12, eyeshadow: 11, nose: 7, mouth: 16, brows: 6, blush: 4, hair_front: 28,
    hair_back: 12, clothes: 149, jackets: 11, hair_accessories: 13, neck_accessories: 6 }},
    { name: "Glacielle", data: { bkg: 6, body: 2, eyes: 13, eyeshadow: 12, nose: 7, mouth: 16, brows: 7, blush: 4, hair_front: 29,
    hair_back: 13, clothes: 150, jackets: 11, hair_accessories: 14, neck_accessories: 9 } },
    { name: "Peahen", data: { bkg: 12, body: 2, eyes: 14, eyeshadow: 13, nose: 7, mouth: 17, brows: 8, blush: 4, hair_front: 31,
    hair_back: 15, clothes: 151, jackets: 11, hair_accessories: 15, neck_accessories: 10 } },
    { name: "Luminosea", data: { bkg: 1, body: 2, eyes: 6, eyeshadow: 8, nose: 7, mouth: 17, brows: 6, blush: 3, hair_front: 8,
    hair_back: 10, clothes: 153, jackets: 11, hair_accessories: 16, neck_accessories: 11 } },
    { name: "Virelle", data: { bkg: 13, body: 2, eyes: 15, eyeshadow: 14, nose: 8, mouth: 18, brows: 9, blush: 4, hair_front: 34,
    hair_back: 18, clothes: 161, jackets: 11, hair_accessories: 21, neck_accessories: 12 } },
    { name: "Crimson Opera", data: { bkg: 14, body: 2, eyes: 16, eyeshadow: 15, nose: 8, mouth: 19, brows: 9, blush: 8, hair_front: 35,
    hair_back: 17, clothes: 162, jackets: 11, hair_accessories: 26, neck_accessories: 12 } },
    { name: "Ethnic Pop", data: { bkg: 15, body: 2, eyes: 17, eyeshadow: 16, nose: 8, mouth: 20, brows: 9, blush: 9, hair_front: 37,
    hair_back: 19, clothes: 163, jackets: 11, hair_accessories: 27, neck_accessories: 1 } },
    { name: "Jade Mirage", data: { bkg: 1, body: 2, eyes: 12, eyeshadow: 5, nose: 8, mouth: 18, brows: 4, blush: 4, hair_front: 24,
    hair_back: 7, clothes: 160, jackets: 11, hair_accessories: 22, neck_accessories: 1 } },
    { name: "Orange Pop", data: { bkg: 17, body: 2, eyes: 18, eyeshadow: 17, nose: 9, mouth: 21, brows: 10, blush: 10, hair_front: 39,
    hair_back: 20, clothes: 164, jackets: 11, hair_accessories: 28, neck_accessories: 1,hands:2 } },
    { name: "Disco Pop", data: { bkg: 17, body: 2, eyes: 19, eyeshadow: 18, nose: 10, mouth: 22, brows: 11, blush: 11, hair_front: 40,
    hair_back: 14, clothes: 165, jackets: 11, hair_accessories: 29, neck_accessories: 14 ,hands: 3} }
    ]
};

// --------------------
// IMAGE LOADING
// --------------------
const loadedImages = {};

function preloadImages(cb) {
    let total = 0, loaded = 0;

    for (const c of assetCategories) {
        loadedImages[c] = {};

        for (let i = 1; i <= assetCounts[c]; i++) {
            total++;

            const img = new Image();
            img.src = `assets/${c}/${i}.png`;

            img.onload = () => {
                loaded++;
                if (loaded === total) cb();
            };

            loadedImages[c][i] = img;
        }
    }
}

// --------------------
// DRAW MAIN CHARACTER
// --------------------
function drawCharacter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (const layer of layerOrder) {

        // 👇 THIS IS THE KEY LINE
        const useIndex = (hoverPreview && hoverPreview.category === layer)
            ? hoverPreview.index
            : equipped[layer];

        const img = loadedImages[layer]?.[useIndex];
        if (!img || !img.complete) continue;

        ctx.drawImage(
            img,
            cx - img.naturalWidth * GLOBAL_SCALE / 2,
            cy - img.naturalHeight * GLOBAL_SCALE / 2,
            img.naturalWidth * GLOBAL_SCALE,
            img.naturalHeight * GLOBAL_SCALE
        );
    }
}

// --------------------
// CATEGORY UI
// --------------------
function createCategoryBars() {
    const main = document.getElementById("categoryBarMain");
    const extra = document.getElementById("categoryBarExtra");
    const combo = document.getElementById("categoryBarExtra2");

    main.innerHTML = "";
    extra.innerHTML = "";
    combo.innerHTML = "";

    const mainCats = ["body","eyes","brows","nose","mouth","bkg"];
    const extraCats = ["eyeshadow","blush","hair_back","hair_front","clothes","jackets","hair_accessories","neck_accessories","hands"];

    function makeBtn(name, container) {
        const btn = document.createElement("button");
        btn.className = "categoryButton";
        btn.textContent = displayNames[name] || name;

        btn.dataset.category = name;

        btn.onclick = () => {
            document.querySelectorAll(".categoryButton")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            showAssets(name);
        };

        container.appendChild(btn);
    }

    mainCats.forEach(c => makeBtn(c, main));
    extraCats.forEach(c => makeBtn(c, extra));

    // IMPORTANT: ONLY 2 BUTTONS
    makeBtn("expressions", combo);
    makeBtn("outfits", combo);

    main.firstChild?.classList.add("active");
}

// --------------------
// SHOW ASSETS / COMBOS
// --------------------
function showAssets(category) {
    const preview = document.getElementById("assetPreview");
    preview.innerHTML = "";

    // COMBOS
    if (category === "expressions" || category === "outfits") {
        combos[category].forEach(combo => {
            const box = document.createElement("div");
            box.className = "assetOption";
            box.textContent = combo.name;

            box.onclick = () => {
                applyCombo(combo.data);
            };

            preview.appendChild(box);
        });
        return;
    }

    // NORMAL ASSETS
    for (let i = 1; i <= assetCounts[category]; i++) {
        const box = document.createElement("div");
        box.className = "assetOption";

        if (equipped[category] === i) box.classList.add("selected");

        const img = document.createElement("img");
        img.src = `assets/${category}/${i}.png`;

        box.appendChild(img);

        // CLICK = permanent equip
box.onclick = () => {
    equipped[category] = i;
    drawCharacter();
    showAssets(category);
};

// HOVER = preview
box.addEventListener("mouseenter", () => {
    hoverPreview = { category, index: i };
    drawCharacter();
});

// LEAVE = remove preview
box.addEventListener("mouseleave", () => {
    hoverPreview = null;
    drawCharacter();
});

        preview.appendChild(box);
    }
}

// --------------------
// APPLY COMBO
// --------------------
function applyCombo(data) {
    Object.assign(equipped, data);
    drawCharacter();

    const active = document.querySelector(".categoryButton.active");
    if (active?.dataset?.category) {
        showAssets(active.dataset.category);
    }
}

// --------------------
// SAVE / DELETE FIXED
// --------------------
function saveOutfit() {
    savedOutfits.push(structuredClone(equipped));
    localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));
    renderSavedOutfits();
}

function deleteOutfit(index) {
    savedOutfits.splice(index, 1);
    localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));
    renderSavedOutfits();
}

// --------------------
// RENDER SAVED (FIXED EVENT BINDING)
// --------------------
function renderSavedOutfits() {
    const container = document.getElementById("savedOutfits");
    container.innerHTML = "";

    savedOutfits.forEach((outfit, index) => {
        const thumb = document.createElement("div");
        thumb.className = "outfitThumb";

        const c = document.createElement("canvas");
        c.width = 80;
        c.height = 80;

        drawOutfitToCanvas(c.getContext("2d"), c, outfit);

        const del = document.createElement("button");
        del.className = "deleteOutfitBtn";
        del.textContent = "×";

        del.onclick = (e) => {
            e.stopPropagation();
            deleteOutfit(index);
        };

        thumb.onclick = () => {
            Object.assign(equipped, outfit);
            drawCharacter();
        };

        thumb.appendChild(c);
        thumb.appendChild(del);
        container.appendChild(thumb);
    });
}

// --------------------
// RANDOM FIXED
// --------------------
function randomizeOutfit() {
    for (const c in assetCounts) {
        equipped[c] = Math.floor(Math.random() * assetCounts[c]) + 1;
    }

    drawCharacter();

    const active = document.querySelector(".categoryButton.active");
    if (active?.dataset?.category) {
        showAssets(active.dataset.category);
    }

    renderSavedOutfits();
}

// --------------------
// MINI PREVIEW DRAW
// --------------------
function drawOutfitToCanvas(ctx2, canvas, outfit) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 0.2;

    for (const layer of layerOrder) {
        const img = loadedImages[layer]?.[outfit[layer]];
        if (!img || !img.complete) continue;

        ctx2.drawImage(
            img,
            cx - img.naturalWidth * scale / 2,
            cy - img.naturalHeight * scale / 2,
            img.naturalWidth * scale,
            img.naturalHeight * scale
        );
    }
}

// --------------------
// INIT (FIXED ORDER)
// --------------------
window.addEventListener("DOMContentLoaded", () => {
    preloadImages(() => {
        createCategoryBars();
        showAssets("body");
        drawCharacter();

        document.getElementById("saveOutfitBtn").onclick = saveOutfit;
        document.getElementById("randomBtn").onclick = randomizeOutfit;

        renderSavedOutfits();
    });
});