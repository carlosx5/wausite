let key;

const pass = {
    checkd1: false,
    checkd2: false,
    pass1: null,
    pass2: null,
    checkLetter: null,
    checkNumber: null,
    checkLength: null,
    checkEqual: null,
};

document.addEventListener("DOMContentLoaded", () => {
    pass.pass1 = document.getElementById("pass1");
    pass.pass2 = document.getElementById("pass2");
    pass.checkLetter = document.getElementById("checkLetter");
    pass.checkNumber = document.getElementById("checkNumber");
    pass.checkLength = document.getElementById("checkLength");
    pass.checkEqual = document.getElementById("checkEqual");

    key = getUrlParameters(window.location.href).key;

    $i("pass1").onkeyup = (event) => events.logPasswordKeyup(event);
    $i("pass2").onkeyup = (event) => events.logPasswordKeyup(event);
    $(".eye-1").onclick = (event) => events.passwordVisibility(event);
    $(".eye-2").onclick = (event) => events.passwordVisibility(event);
    $i("btnRecover").onclick = () => update();
});

const update = async () => {
    if (!pass.checkd1) return;

    const password = pass.pass1.value;

    const resp = await $fetch({
        url: "login/passwordRecoverSave",
        par: { key, password },
        fnName: "SALVA SENHA WAU-0166",
        overlay: false,
    });

    //ERRO
    if (resp.status != 200) {
        $toast(resp.msg, "danger");
        return false;
    }

    message.changedMessage();
    setTimeout(() => {
        if (window.innerWidth < 1000) {
            window.location.href = `${baseURL}mensagem/login-desktop`;
        } else {
            window.location.href = `${baseURL}login`;
        }
    }, 2000);
};

const validatePassword = () => {
    validatePass1();
    validatePass2();

    function validatePass1() {
        const value = pass.pass1.value;

        //:Validação: Mínimo de 1 letra (maiúscula ou minúscula)
        const checkLetterOk = /[a-zA-Z]/.test(value);
        pass.checkLetter.classList.toggle("validate", checkLetterOk);

        //:Validação: Mínimo de 1 número
        const checkNumberOk = /\d/.test(value);
        pass.checkNumber.classList.toggle("validate", checkNumberOk);

        //:Validação: Total de 8 caracteres
        const checkLengthOk = value.length >= 8;
        pass.checkLength.classList.toggle("validate", checkLengthOk);

        pass.checkd1 = checkLetterOk && checkNumberOk && checkLengthOk;
    }

    function validatePass2() {
        pass.checkd2 = pass.pass1.value === pass.pass2.value;
        pass.checkd2 = pass.pass1.value && pass.pass2.value ? pass.checkd2 : false;

        pass.checkEqual.classList.toggle("validate", pass.checkd2);
    }
};

const events = {
    logPasswordKeyup(event) {
        const target = event.target;

        if (target.closest("#pass1")) {
            if (event.type == "keyup") {
                if (event.key == "Enter") return $i("pass2").focus();

                target.value = target.value.replace(/\s/g, "");

                return validatePassword();
            }
        }

        if (target.closest("#pass2")) {
            if (event.type == "keyup") {
                if (event.key == "Enter") return update();

                return validatePassword();
            }
        }
    },

    passwordVisibility(event) {
        const icon = event.target;
        const wrapper = icon.closest(".input-wrapper");
        const input = wrapper.querySelector("input");

        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    },
};

const getUrlParameters = (url) => {
    var result = {};
    var searchIndex = url.indexOf("?");
    if (searchIndex == -1) return result;
    var sPageURL = url.substring(searchIndex + 1);
    var sURLVariables = sPageURL.split("&");
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split("=");
        result[sParameterName[0]] = sParameterName[1];
    }
    return result;
};

const message = {
    errorPasswordEmpty() {
        $toast("Preencha os campos de senha!", "danger");
    },

    errorPasswordDifferent() {
        $toast("As senhas não são iguais!", "danger");
    },

    changedMessage() {
        $toast("Senha alterada com sucesso!", "success");
    },
};
