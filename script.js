const canvas = document.getElementById("dressCanvas");
const ctx = canvas.getContext("2d");

// --- Global scale factor ---
const GLOBAL_SCALE = 0.7; // 90% size

// --- Categories and layering ---
const categories = [
    "body",
    "eyes",
    "eyeshadow",
    "nose",
    "mouth",
    "brows",
    "blush",
    "hair_front",
    "hair_back",
    "clothes",
    "jackets",
    "hair_accessories",
    "neck_accessories",
    "bkg"
];

const layerOrder = [
    "bkg",
    "hair_back",
    "body",
    "eyeshadow",
    "eyes",
    "nose",
    "mouth",
    "brows",
    "blush",
    "clothes",
    "jackets",
    "neck_accessories",
    "hair_front",
    "hair_accessories"
    
];

// --- Offsets (can tweak per layer) ---
const offsets = {
    body: { x: -15, y: 60 } // will be scaled

};

// --- Asset counts ---
const assetCounts = {
    bkg: 5,
    body: 1,
    eyes: 10,
    eyeshadow: 5,
    nose: 6,
    mouth: 15,
    brows: 4,
    blush: 7,
    hair_front: 23,
    hair_back: 9,
    clothes: 129,
    jackets: 17,
    hair_accessories: 8,
    neck_accessories: 8
};

// --- Equipped assets (default first) ---
const equipped = {
    bkg: 1,
    body: 1,
    eyes: 8,
    eyeshadow: 3,
    nose: 1,
    mouth: 5,
    brows: 4,
    blush: 4,
    hair_front: 8,
    hair_back: 4,
    clothes: 110,
    jackets: 11,
    hair_accessories: 5,
    neck_accessories: 6
};

// --- Loaded images storage ---
const loadedImages = {};

// --- Preload images ---
function preloadImages(callback) {
    let totalImages = 0;
    let loadedCount = 0;

    for (const category in assetCounts) {
        loadedImages[category] = {};

        for (let i = 1; i <= assetCounts[category]; i++) {
            totalImages++;

            const img = new Image();
            img.src = `assets/${category}/${i}.png`;

            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    callback();
                }
            };

            img.onerror = () => {
                console.error(`Failed to load: assets/${category}/${i}.png`);
            };

            loadedImages[category][i] = img;
        }
    }
}

// --- Draw character with scaled images and offsets ---
function drawCharacter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (const layer of layerOrder) {
        const img = loadedImages[layer]?.[equipped[layer]];
        const offset = offsets[layer] || { x: 0, y: 0 };

        if (img && img.complete && img.naturalWidth > 0) {
            const scaledOffsetX = offset.x * GLOBAL_SCALE;
            const scaledOffsetY = offset.y * GLOBAL_SCALE;

            ctx.drawImage(
                img,
                centerX - (img.naturalWidth / 2) * GLOBAL_SCALE + scaledOffsetX,
                centerY - (img.naturalHeight / 2) * GLOBAL_SCALE + scaledOffsetY,
                img.naturalWidth * GLOBAL_SCALE,
                img.naturalHeight * GLOBAL_SCALE
            );
        }
    }
}

// --- Create category bar ---
function createCategoryBar() {
    const bar = document.getElementById("categoryBar");

    categories.forEach((category, index) => {
        const btn = document.createElement("button");
        btn.className = "categoryButton";
        btn.textContent = category;

        btn.onclick = () => {
            document.querySelectorAll(".categoryButton")
                .forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            showAssetOptions(category);
        };

        if (index === 0) btn.classList.add("active");

        bar.appendChild(btn);
    });
}

// --- Show asset previews ---
function showAssetOptions(category) {
    const preview = document.getElementById("assetPreview");
    preview.innerHTML = "";

    for (let i = 1; i <= assetCounts[category]; i++) {
        const option = document.createElement("div");
        option.className = "assetOption";

        if (equipped[category] === i) option.classList.add("selected");

        const img = document.createElement("img");
        img.src = `assets/${category}/${i}.png`;
        img.style.maxWidth = "70px";
        img.style.maxHeight = "70px";

        option.appendChild(img);

        option.onclick = () => {
            equipped[category] = i;
            drawCharacter();
            showAssetOptions(category); // refresh selection highlight
        };

        preview.appendChild(option);
    }
}

// --- Initialize page ---
window.onload = () => {
    preloadImages(() => {
        createCategoryBar();
        showAssetOptions("body");
        drawCharacter();
    });
};