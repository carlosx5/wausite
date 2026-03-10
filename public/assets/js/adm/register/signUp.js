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
            v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
            v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        } else if (v.length > 0) {
            v = `(${v}`;
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

//:Aplicar máscaras ao carregar a página
applyPhoneMask(document.getElementById("signupPhone"));
applyPhoneMask(document.getElementById("signupPayPhone"));
applyCpfMask(document.getElementById("signupCpf"));
applyCnpjMask(document.getElementById("signupCnpj"));
applyCepMask(document.getElementById("signupCep"));

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
    btn.classList.add("clicked");
    btn.innerHTML = '<i class="fa-light fa-solid fa-spinner-third fa-spin"></i> <span>Enviando...</span>';

    const formData = new FormData();
    formData.append(CSRF_TOKEN, CSRF_HASH);

    //:Dados Pessoais
    formData.append("name", document.getElementById("signupName").value);
    formData.append("phone", document.getElementById("signupPhone").value);
    formData.append("email", document.getElementById("signupEmail").value);
    formData.append("rg", document.getElementById("signupRg").value);
    formData.append("cpf", document.getElementById("signupCpf").value);

    //:Dados da Clínica
    formData.append("razao_social", document.getElementById("signupRazaoSocial").value);
    formData.append("nome_fantasia", document.getElementById("signupNomeFantasia").value);
    formData.append("cnpj", document.getElementById("signupCnpj").value);
    formData.append("endereco", document.getElementById("signupEndereco").value);
    formData.append("cidade", document.getElementById("signupCidade").value);
    formData.append("estado", document.getElementById("signupEstado").value);
    formData.append("cep", document.getElementById("signupCep").value);

    //:Dados para Pagamento
    formData.append("pay_phone", document.getElementById("signupPayPhone").value);
    formData.append("pay_email", document.getElementById("signupPayEmail").value);

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
