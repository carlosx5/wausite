const baseURL = location.hostname == "localhost" ? `http://localhost/wausite/public/` : `https://${location.hostname}/`;

//:Passo atual
let currentStep = 1;

function $(selector, selector2 = false) {
    //:Se "selector" for node
    if (selector.nodeType) {
        if (!selector2) return selector; //:Se "selector2" for false retorna o node

        return selector.querySelector(selector2); //:Retorna o objeto do "selector2"
    }

    //:Se for mais de um seletor
    if (selector.includes(",")) return document.querySelectorAll(selector);

    //:Retorna padrão
    return document.querySelector(selector);
}

//:Navegação entre etapas
function nextStep(step) {
    //:Validar campos obrigatórios da etapa atual antes de avançar
    const currentStepEl = document.getElementById("step" + currentStep);
    const inputs = currentStepEl.querySelectorAll("input[required], select[required]");
    let valid = true;

    inputs.forEach((input) => {
        if (!input.value.trim()) {
            input.style.borderColor = "#ff6b6b";
            valid = false;
            setTimeout(() => {
                input.style.borderColor = "";
            }, 2000);
        }
    });

    if (!valid) return;

    //:Validar senhas na etapa 3
    if (currentStep === 3) {
        if (!passValidation.checkd1 || !passValidation.checkd2) return;
    }

    //:Esconder etapa atual e mostrar próxima
    document.getElementById("step" + currentStep).classList.remove("active");
    document.getElementById("step" + step).classList.add("active");

    //:Atualizar indicador de passos
    document.getElementById("stepIndicator" + currentStep).classList.remove("active");
    document.getElementById("stepIndicator" + currentStep).classList.add("completed");
    document.getElementById("stepIndicator" + step).classList.add("active");

    //:Ativar linha entre passos
    if (currentStep < step) {
        document.getElementById("stepLine" + currentStep).classList.add("active");
    }

    currentStep = step;

    //:Scroll suave pro topo
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevStep(step) {
    //:Esconder etapa atual e mostrar anterior
    document.getElementById("step" + currentStep).classList.remove("active");
    document.getElementById("step" + step).classList.add("active");

    //:Atualizar indicador de passos
    document.getElementById("stepIndicator" + currentStep).classList.remove("active");
    document.getElementById("stepIndicator" + step).classList.remove("completed");
    document.getElementById("stepIndicator" + step).classList.add("active");

    //:Desativar linha entre passos
    if (step < currentStep) {
        document.getElementById("stepLine" + step).classList.remove("active");
    }

    currentStep = step;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

//:Máscara de telefone
function applyPhoneMask(input) {
    input.addEventListener("input", function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 6) {
            v = `${v.slice(0, 2)} ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
            v = `${v.slice(0, 2)} ${v.slice(2)}`;
        }
        e.target.value = v;
    });
}

//:Máscara de CPF
function applyCpfMask(input) {
    input.addEventListener("input", function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) {
            v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
        } else if (v.length > 6) {
            v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
        } else if (v.length > 3) {
            v = `${v.slice(0, 3)}.${v.slice(3)}`;
        }
        e.target.value = v;
    });
}

//:Máscara de CNPJ
function applyCnpjMask(input) {
    input.addEventListener("input", function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 14) v = v.slice(0, 14);
        if (v.length > 12) {
            v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
        } else if (v.length > 8) {
            v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
        } else if (v.length > 5) {
            v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
        } else if (v.length > 2) {
            v = `${v.slice(0, 2)}.${v.slice(2)}`;
        }
        e.target.value = v;
    });
}

//:Máscara de CEP
function applyCepMask(input) {
    input.addEventListener("input", function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 8) v = v.slice(0, 8);
        if (v.length > 5) {
            v = `${v.slice(0, 5)}-${v.slice(5)}`;
        }
        e.target.value = v;
    });
}

//:Forçar minúsculo em campos de e-mail
function applyEmailLowercase(input) {
    if (!input) return;
    input.addEventListener("input", function (e) {
        e.target.value = e.target.value.toLowerCase();
    });
}

//:Aplicar máscaras ao carregar a página
applyPhoneMask(document.getElementById("signupPhone"));
applyPhoneMask(document.getElementById("signupPayPhone"));
applyCpfMask(document.getElementById("signupCpf"));
applyCnpjMask(document.getElementById("signupCnpj"));
applyCepMask(document.getElementById("signupCep"));

//:Aplicar minúsculo nos e-mails
document.querySelectorAll('input[type="email"]').forEach(applyEmailLowercase);

//:Toggle visibilidade da senha
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

//:Validação de senha em tempo real
const passValidation = {
    checkd1: false,
    checkd2: false,
};

function validatePassword() {
    const pass1 = document.getElementById("signupPassword").value;
    const pass2 = document.getElementById("signupPasswordConfirm").value;

    //:Mínimo de 1 letra
    const hasLetter = /[a-zA-Z]/.test(pass1);
    document.getElementById("checkLetter").classList.toggle("validate", hasLetter);

    //:Mínimo de 1 número
    const hasNumber = /\d/.test(pass1);
    document.getElementById("checkNumber").classList.toggle("validate", hasNumber);

    //:Mínimo de 8 caracteres
    const hasLength = pass1.length >= 8;
    document.getElementById("checkLength").classList.toggle("validate", hasLength);

    passValidation.checkd1 = hasLetter && hasNumber && hasLength;

    //:Senhas iguais
    const isEqual = pass1 && pass2 && pass1 === pass2;
    document.getElementById("checkEqual").classList.toggle("validate", isEqual);

    passValidation.checkd2 = isEqual;

    //:Atualizar cor do botão Próximo
    const btnNext = document.getElementById("btnPasswordNext");
    btnNext.classList.toggle("valid", passValidation.checkd1 && passValidation.checkd2);
}

document.getElementById("signupPassword").addEventListener("keyup", validatePassword);
document.getElementById("signupPasswordConfirm").addEventListener("keyup", validatePassword);

//:Busca endereço pelo CEP (ViaCEP)
document.getElementById("signupCep").addEventListener("change", async function () {
    const cep = this.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
        const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await resp.json();

        if (data.erro) {
            this.style.setProperty("border-color", "red", "important");
            return;
        }

        this.style.borderColor = "";
        document.getElementById("signupEndereco").value = data.logradouro || "";
        document.getElementById("signupBairro").value = data.bairro || "";
        document.getElementById("signupCidade").value = data.localidade || "";
        document.getElementById("signupEstado").value = data.uf || "";
    } catch (err) {
        console.error("Erro ao buscar CEP:", err);
    }
});

//:Envio do formulário
function submitSignUp(event) {
    event.preventDefault();

    const btn = document.getElementById("btnSubmitSignUp");
    //!!btn.classList.add("clicked");
    btn.innerHTML = '<i class="fa-light fa-solid fa-spinner-third fa-spin"></i> <span>Enviando...</span>';

    const formData = new FormData();
    formData.append(CSRF_TOKEN, CSRF_HASH);

    //:Dados Pessoais
    const userData = {
        name: document.getElementById("signupName").value,
        phone_number: document.getElementById("signupPhone").value,
        email: document.getElementById("signupEmail").value,
        rg: document.getElementById("signupRg").value,
        cpf: document.getElementById("signupCpf").value,
    };

    //:Dados da Clínica
    const clinicData = {
        name_corporate: document.getElementById("signupRazaoSocial").value,
        name_trading: document.getElementById("signupNomeFantasia").value,
        cnpj: document.getElementById("signupCnpj").value,
        address: document.getElementById("signupEndereco").value,
        address_number: document.getElementById("signupNumero").value,
        address_complement: document.getElementById("signupComplemento").value,
        address_neighb: document.getElementById("signupBairro").value,
        address_city: document.getElementById("signupCidade").value,
        address_state: document.getElementById("signupEstado").value,
        address_zip: document.getElementById("signupCep").value,
    };

    //:Senha
    const passwordData = {
        password: document.getElementById("signupPassword").value,
    };

    //:Dados para Pagamento
    const payData = {
        pay_phoneNumber: document.getElementById("signupPayPhone").value,
        pay_email: document.getElementById("signupPayEmail").value,
    };

    formData.append("userData", JSON.stringify(userData));
    formData.append("clinicData", JSON.stringify(clinicData));
    formData.append("passwordData", JSON.stringify(passwordData));
    formData.append("payData", JSON.stringify(payData));

    fetch(SIGNUP_URL, {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Cadastro Ok");
            console.log(data);
        })
        .catch((err) => {
            console.log("Erro ao enviar");
            console.log(err);
            btn.classList.remove("clicked");
            btn.innerHTML = '<span>Finalizar Cadastro</span> <i class="fa-solid fa-check"></i>';
        });

    return false;
}

/** //:ABRE MODAL
 * @param {string} selector
 */
const $modalOpen = (selector) => {
    const modalInstance = bootstrap.Modal.getOrCreateInstance($(selector));
    modalInstance.show();

    // const meuModal = new bootstrap.Modal(document.getElementById(modalId));
    // meuModal.show();
};

/** //:FECHA MODAL
 * @param {string} selector
 */
const $modalClose = (selector) => {
    const modalInstance = bootstrap.Modal.getOrCreateInstance($(selector));
    modalInstance.hide();
};

const video = {
    open: async function (videoId = null) {
        if (!videoId) return;

        try {
            //:Cria src do video
            createSrc(videoId);

            //:Abre modal
            $modalOpen("#modalVideo");
        } catch (err) {
            console.error("Erro ao abrir vídeo:", err);
        }

        function createSrc(videoId) {
            const src = `https://player.mediadelivery.net/embed/597408/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
            const iframe = document.querySelector("#modalVideo iframe");
            iframe.src = src;
        }
    },

    close() {
        const iframe = document.querySelector("#modalVideo iframe");
        iframe.src = "";

        $modalClose("#modalVideo");
    },
};
