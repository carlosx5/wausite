const baseURL = location.hostname == "localhost" ? `http://localhost/wauclinic/public/` : `https://${location.hostname}/`;

document.addEventListener("DOMContentLoaded", async () => {
    localStorage.clear();

    const container = document.querySelector(".container");
    ["click", "keyup"].forEach((event) => container.addEventListener(event, (ev) => events(ev)));

    if (cookie.get("log_email")) {
        $("#email").value = cookie.get("log_email");
        $("#rememberEmail").checked = true;
    }

    if (cookie.get("log_password")) {
        $("#password").value = cookie.get("log_password");
        $("#rememberPassword").checked = true;
    }
});

const doLogin = async () => {
    const email = $("#email").value;
    const password = $("#password").value;
    const rememberEmail = $("#rememberEmail").checked;
    const rememberPassword = $("#rememberPassword").checked;

    if (rememberEmail) {
        cookie.set("log_email", email);
    } else {
        cookie.del("log_email");
    }

    if (rememberPassword) {
        cookie.set("log_password", password);
    } else {
        cookie.del("log_password");
    }

    cookie.set("screenSize", `${window.innerWidth}x${window.innerHeight}`);

    if (email == "" || password == "") {
        $toast("Preencha todos os campos!");
        return;
    }

    let resp;
    try {
        resp = await fetch("login/doLogin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": window.CSRF_TOKEN,
            },
            body: JSON.stringify({ email, password }),
        });
        resp = await resp.json();
        console.log("resp: ", resp);
        if (resp.msg) {
            $toast(resp.msg);
            return;
        }

        window.location.href = `${baseURL}home`;
        return;
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        $toast("Erro ao conectar com o servidor.");
        return;
    }
};

const passwordRecover = async () => {
    const btn = $(".passwordRecover");
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 200);

    const email = $("#email").value;
    if (email.length < 8) return $toast("Digite seu email antes de prosseguir!");

    $toast("Enviando email...");

    let resp;
    try {
        resp = await fetch("login/passwordRecover", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": window.CSRF_TOKEN,
            },
            body: JSON.stringify({ email }),
        });
        resp = await resp.json();
        console.log("resp: ", resp);
        // if (resp.msg) {
        //     $toast(resp.msg);
        // }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        $toast("Erro ao conectar com o servidor.");
        return;
    }

    $toast("Cheque seu email!");
};

const events = (event) => {
    console.log("event:", event);

    //:Enter
    if (event.key === "Enter") {
        //:Enter em email
        if (event.target.closest("#email")) {
            inputEmail();
            $("#password").focus();
            return;
        }

        //:Enter em senha
        if (event.target.closest("#password")) return doLogin();
    }

    //:Botão de login
    if (event.target.closest("#email")) return inputEmail();
    //:Imput email
    if (event.target.closest(".btnLogin")) return doLogin();
    //:Checkbox rememberEmail
    if (event.target.closest("#rememberEmail")) return rememberEmail();
    //:Checkbox rememberPassword
    if (event.target.closest("#rememberPassword")) return rememberPassword();
    //:Recupera senha
    if (event.target.closest(".passwordRecover")) return passwordRecover();
    //:Olho da senha
    if (event.target.closest(".fa-eye") || event.target.closest(".fa-eye-slash")) return showPassword();

    function inputEmail() {
        const node = $("#email");
        node.value = node.value.toLowerCase();
    }

    function rememberEmail() {
        const rememberEmail = $("#rememberEmail").checked;
        if (!rememberEmail) cookie.del("log_email");
    }

    function rememberPassword() {
        const rememberPassword = $("#rememberPassword").checked;
        if (!rememberPassword) cookie.del("log_password");
    }

    function showPassword() {
        const node = $("#password");
        const eye = event.target.closest(".fa-eye, .fa-eye-slash");
        const isPassword = node.type === "password";
        node.type = isPassword ? "text" : "password";
        eye.classList.toggle("fa-eye");
        eye.classList.toggle("fa-eye-slash");
    }
};

//:Query Selector
const $ = (selector, selector2 = false) => {
    if (selector.nodeType) {
        if (!selector2) return selector;
        return selector.querySelector(selector2);
    }

    //:Se for mais de um seletor
    if (selector.includes(",")) return document.querySelectorAll(selector);

    //:Retorna padrão
    return document.querySelector(selector);
};

const cookie = {
    get(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                let result = c.substring(name.length, c.length);
                return decodeURIComponent(result).replace(/[+]+/g, " "); //REMOVE CARACTERES ESPECIAIS
            }
        }
        return "";
    },

    set(cname, cvalue, exdays, path = "") {
        var d = new Date();
        var exdays = exdays ? exdays : 365;
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + path;
    },

    del(cname) {
        var d = new Date();
        d.setTime(d.getTime() + -1 * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + "xxx" + ";" + expires + ";path=/";
    },

    delAll() {
        var c = document.cookie.split("; ");
        for (i in c) document.cookie = /^[^=]+/.exec(c[i])[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    },
};

//:Toast
const $toast = (text) => {
    const father = $(".toast-container");
    const toast = bootstrap.Toast.getOrCreateInstance($(father, "div"));
    const classRemoveList = ["success", "warning", "danger"];
    classRemoveList.forEach((cls) => father.classList.remove(cls));

    //:Elemanto pai
    const fatherClass = "bottom-0 end-0 p-3";
    father.classList.add(...fatherClass.split(" "));

    //:Define se a mensagem terá duas linhas
    text = text.split("|");
    const txt1 = text[0] || "";
    const txt2 = text[1] ? `<br>${text[1]}` : "";
    //:Inserir mensagem
    $(father, ".toast-body").innerHTML = `${txt1}${txt2}` || "";

    toast.show();
};
