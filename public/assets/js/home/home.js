document.addEventListener("DOMContentLoaded", () => {
    matriz.init();

    //:Logout
    const logoutNode = document.querySelector(".logout");
    logoutNode.addEventListener("click", () => logout());

    //:Muda cor
    const boxColor = document.querySelector(".box-color");
    boxColor.addEventListener("click", (el) => {
        const target = el.target;
        const color = target.dataset.color;

        if (color) updateColor(color);
    });

    //:Botão de ajuda
    const videoId = g.video.home;
    $sidebar.goHelp.setIconId(videoId);
});

const matriz = {
    initMatrix() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;

        const columns = this.canvas.width / this.fontSize;
        this.drops = [];
        for (let i = 0; i < columns; i++) {
            this.drops[i] = Math.random() * this.canvas.height;
        }
    },

    drawMatrix() {
        matriz.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        matriz.ctx.fillRect(0, 0, matriz.canvas.width, matriz.canvas.height);

        matriz.ctx.fillStyle = matriz.color;
        matriz.ctx.font = matriz.fontSize + "px monospace";

        for (let i = 0; i < matriz.drops.length; i++) {
            const text = matriz.charArray[Math.floor(Math.random() * matriz.charArray.length)];

            matriz.ctx.fillText(text, i * matriz.fontSize, matriz.drops[i]);

            // Faz subir (Diminui Y)
            matriz.drops[i] -= matriz.fontSize;

            if (matriz.drops[i] < 0 && Math.random() > 0.975) {
                matriz.drops[i] = matriz.canvas.height;
            }
        }
    },

    init() {
        this.canvas = document.getElementById("matrixCanvas");
        this.ctx = this.canvas.getContext("2d");

        const colors = {
            verde: "#2dd4bf",
            azul: "#00ccffff",
            vinho: "#ff00d4ff",
            rosa: "#ff00d4ff",
        };
        this.color = colors[g.theme] || colors.verde;

        this.chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
        this.charArray = this.chars.split("");
        this.fontSize = 14;
        this.drops = [];

        this.initMatrix();
        setInterval(this.drawMatrix, 35);
    },
};

async function logout() {
    const resp = await $fetch({
        url: "login/doLogout",
        overlay: false,
        fnName: "FAZ LOGOUT WAU-0170",
    });

    if (resp?.status === 200) {
        window.location.href = "login";
    }
}

async function updateColor(color) {
    let resp;

    try {
        resp = await fetch("userConfig/colorChange", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": window.CSRF_TOKEN,
            },
            body: JSON.stringify({ color }),
        });

        resp = await resp.json();
        console.log("resp: ", resp);
    } catch (error) {
        console.error(error);
        return;
    }

    window.location.reload();
}
