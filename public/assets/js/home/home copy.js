document.addEventListener("DOMContentLoaded", () => {
    const boxColor = document.querySelector(".box-color");

    //:Logout
    const logoutNode = document.querySelector(".logout");
    logoutNode.addEventListener("click", () => logout());

    //:Muda cor
    boxColor.addEventListener("click", (el) => {
        const target = el.target;
        const color = target.dataset.color;
        console.log("color:", color);

        if (color) updateColor(color);
    });

    //:Botão de ajuda
    const videoId = g.video.home;
    $sidebar.goHelp.setIconId(videoId);
});

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
