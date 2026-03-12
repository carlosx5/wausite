function startLead() {
    const btn = document.getElementById("btnStart");
    btn.classList.add("clicked");
    btn.innerHTML = '<i class="fa-light fa-solid fa-spinner-third fa-spin"></i> <span>Carregando...</span>';

    const screenWelcome = document.getElementById("screenWelcome");
    const screenForm = document.getElementById("screenForm");

    //:Fade out da tela de boas-vindas
    setTimeout(() => {
        screenWelcome.classList.add("fade-out");

        //:Após a animação de saída, mostra o formulário
        setTimeout(() => {
            screenWelcome.style.display = "none";
            screenForm.classList.add("active");
        }, 600);
    }, 800);
}

//:Capitalizar nome (primeira letra de cada palavra em maiúsculo)
document.getElementById("leadName").addEventListener("input", function (e) {
    let words = e.target.value.split(" ");
    for (let i = 0; i < words.length; i++) {
        if (words[i].length > 0) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }
    }
    e.target.value = words.join(" ");
});

//:Máscara de telefone
document.getElementById("leadPhone").addEventListener("input", function (e) {
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

//:Forçar minúsculo nos e-mails
document.querySelectorAll('input[type="email"]').forEach((input) => {
    input.addEventListener("input", function (e) {
        e.target.value = e.target.value.toLowerCase();
    });
});

function submitLead(event) {
    event.preventDefault();

    const btn = document.getElementById("btnSubmit");
    btn.classList.add("clicked");
    btn.innerHTML = '<i class="fa-light fa-solid fa-spinner-third fa-spin"></i> <span>Enviando...</span>';

    const formData = new FormData();
    formData.append(CSRF_TOKEN, CSRF_HASH);
    formData.append("name", document.getElementById("leadName").value);
    formData.append("phone", document.getElementById("leadPhone").value);
    formData.append("email", document.getElementById("leadEmail").value);
    formData.append("isMobile", window.innerWidth <= 768 ? 1 : 0);

    console.log(formData);

    fetch(LEAD_SEND_URL, {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                //:Mobile: transição suave para tela de sucesso
                const screenForm = document.getElementById("screenForm");
                const screenSuccess = document.getElementById("screenSuccess");

                screenForm.classList.add("fade-out");

                setTimeout(() => {
                    screenForm.style.display = "none";
                    screenSuccess.style.display = "flex";
                    screenSuccess.classList.add("active");
                }, 600);
            } else {
                //:Desktop: transição suave para tela de sucesso desktop
                const screenForm = document.getElementById("screenForm");
                const screenSuccessDesktop = document.getElementById("screenSuccessDesktop");

                screenForm.classList.add("fade-out");

                setTimeout(() => {
                    screenForm.style.display = "none";
                    screenSuccessDesktop.style.display = "flex";
                    screenSuccessDesktop.classList.add("active");
                }, 600);
            }
        })
        .catch((err) => {
            alert("Erro ao enviar. Tente novamente.");
            btn.classList.remove("clicked");
            btn.innerHTML = '<span>Enviar</span> <i class="fa-solid fa-paper-plane"></i>';
        });

    return false;
}
