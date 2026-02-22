//:Elementos do DOM
const hueBox = document.getElementById("hueBox");
const paletteBox = document.getElementById("paletteBox");
const hueDot = document.getElementById("hueDot");
const paletteDot = document.getElementById("paletteDot");
const previewBox = document.getElementById("previewBox");
const previewText = document.getElementById("previewText");

const hueCtx = hueBox.getContext("2d");
const boxCtx = paletteBox.getContext("2d");

//:Variáveis de Estado
let hue = 0;
let fixedX = 0;
let fixedY = 0;
let hasClickedColor = false;
let isDraggingColor = false;
let isDraggingHue = false;

//:Eventos Globais
document.addEventListener("mousemove", (e) => {
    if (isDraggingHue) handleHuePick(e);
    if (isDraggingColor) handlePalettePick(e);
});

document.addEventListener("mouseup", () => {
    isDraggingHue = false;
    isDraggingColor = false;
});

hueBox.addEventListener("mousedown", () => (isDraggingHue = true));
paletteBox.addEventListener("mousedown", () => (isDraggingColor = true));

//:Inicialização
drawHueBox();
drawPaletteBox(hue);
initializeColorPrecisely("25, 43, 51"); //:inicializa com a cor indicada.

//:Funções Principais
function handleHuePick(e) {
    const rect = hueBox.getBoundingClientRect();
    const x = Math.max(0, Math.min(hueBox.width - 1, e.clientX - rect.left));
    const pixel = hueCtx.getImageData(x, 1, 1, 1).data;

    hue = rgbToHsl(pixel[0], pixel[1], pixel[2])[0];
    updatePreviewFromHue();

    hueDot.style.cssText = `left: ${x}px; top: ${hueBox.height / 2}px; display: block;`;
}

function handlePalettePick(e) {
    const rect = paletteBox.getBoundingClientRect();
    const x = Math.max(0, Math.min(paletteBox.width - 1, e.clientX - rect.left));
    const y = Math.max(0, Math.min(paletteBox.height - 1, e.clientY - rect.top));

    fixedX = x;
    fixedY = y;
    hasClickedColor = true;

    const [r, g, b] = boxCtx.getImageData(x, y, 1, 1).data;
    result(r, g, b);

    paletteDot.style.cssText = `left: ${x}px; top: ${y}px; display: block;`;
}

function updatePreviewFromHue() {
    drawPaletteBox(hue);

    if (hasClickedColor) {
        const [r, g, b] = boxCtx.getImageData(fixedX, fixedY, 1, 1).data;
        result(r, g, b);
    } else {
        const [r, g, b] = hslToRgb(hue / 360, 1, 0.5);
        result(r, g, b);
    }
}

//:Funções de Desenho
function drawHueBox() {
    const gradient = hueCtx.createLinearGradient(0, 0, hueBox.width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.17, "magenta");
    gradient.addColorStop(0.34, "blue");
    gradient.addColorStop(0.51, "cyan");
    gradient.addColorStop(0.68, "lime");
    gradient.addColorStop(0.85, "yellow");
    gradient.addColorStop(1, "red");

    hueCtx.fillStyle = gradient;
    hueCtx.fillRect(0, 0, hueBox.width, hueBox.height);
}

function drawPaletteBox(hue) {
    boxCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    boxCtx.fillRect(0, 0, paletteBox.width, paletteBox.height);

    const whiteGrad = boxCtx.createLinearGradient(0, 0, paletteBox.width, 0);
    whiteGrad.addColorStop(0, "white");
    whiteGrad.addColorStop(1, "transparent");
    boxCtx.fillStyle = whiteGrad;
    boxCtx.fillRect(0, 0, paletteBox.width, paletteBox.height);

    const blackGrad = boxCtx.createLinearGradient(0, 0, 0, paletteBox.height);
    blackGrad.addColorStop(0, "transparent");
    blackGrad.addColorStop(1, "black");
    boxCtx.fillStyle = blackGrad;
    boxCtx.fillRect(0, 0, paletteBox.width, paletteBox.height);
}

//:Funções Auxiliares
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function result(r, g, b) {
    const rgbString = `rgb(${r}, ${g}, ${b})`;
    previewBox.style.backgroundColor = rgbString;
    previewText.textContent = `RGB: ${r}, ${g}, ${b}`;

    document.documentElement.style.setProperty(selectors.selected, rgbString);
    $(`.${selectors.selected} .form-control`).value = rgbString;
}

function initializeColorPrecisely(rgbInit) {
    rgbInit = rgbInit.replace(/rgb|\(|\)/g, ""); //:Remove "rgb", "(", ")"
    rgbInit = rgbInit.replace(/\s+/g, ""); //:Remove espaços em branco
    rgbInit = rgbInit.split(","); //:Cria array com string de numeros
    rgbInit = rgbInit.map(Number); //:Transforma array em numeros

    const [targetR, targetG, targetB] = rgbInit;

    const [h] = rgbToHsl(targetR, targetG, targetB);
    hue = h;
    drawPaletteBox(hue);

    let closestX = 0,
        closestY = 0,
        minDistance = Infinity;

    for (let y = 0; y < paletteBox.height; y++) {
        for (let x = 0; x < paletteBox.width; x++) {
            const [r, g, b] = boxCtx.getImageData(x, y, 1, 1).data;
            const distance = Math.hypot(r - targetR, g - targetG, b - targetB);
            if (distance < minDistance) {
                minDistance = distance;
                closestX = x;
                closestY = y;
            }
        }
    }

    fixedX = closestX;
    fixedY = closestY;
    hasClickedColor = true;

    const [r, g, b] = boxCtx.getImageData(fixedX, fixedY, 1, 1).data;
    result(r, g, b);

    let hueClosestX = 0,
        hueMinDistance = Infinity;

    for (let x = 0; x < hueBox.width; x++) {
        const [r, g, b] = hueCtx.getImageData(x, 1, 1, 1).data;
        const [pixelHue] = rgbToHsl(r, g, b);
        const distance = Math.abs(pixelHue - hue);
        if (distance < hueMinDistance) {
            hueMinDistance = distance;
            hueClosestX = x;
        }
    }

    hueDot.style.cssText = `left: ${hueClosestX}px; top: ${hueBox.height / 2}px; display: block;`;
    paletteDot.style.cssText = `left: ${fixedX}px; top: ${fixedY}px; display: block;`;
}
