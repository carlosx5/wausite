ls.init("none");

document.addEventListener("DOMContentLoaded", () => {
    $trigger("[name=name]", "blur");

    //MASK
    mask.phone.init("[name=cell]");

    $(".btnAccept").onclick = () => btnAccept();
    $(".btnRegister").onclick = () => btnRegister();
    $("[name=email]").addEventListener("keyup", (e) => (e.currentTarget.value = e.currentTarget.value.toLowerCase()));
    $("[name=userName]").addEventListener("keyup", (e) => (e.target.value = mask.username(e.target.value)));
    $("[name=password]").addEventListener("keyup", (e) => (e.target.value = mask.password(e.target.value)));
});

const btnAccept = () => {
    $(".f_info").style.display = "none";
    $(".f_register").style.display = "block";
};

const btnRegister = async function () {
    const data = {};
    const elList = document.querySelectorAll("[js=d_data] input");

    //CONSTROI DATA
    for (const el of elList) data[el.name] = el.value;
    data["name_prefix"] = $("[name=name_prefix]").value;
    data["invitingId"] = g.invitingId;
    data["key"] = g.key;
    data["name_social"] = $firstLastName(data["name"]);
    delete data["nm_clinic"];

    const resp = await $fetch({
        url: "user/invite/user_invite_register/doRegister",
        par: { data },
        fnName: "ENVIA CADASTRO #575",
        messageType: 2,
    });

    if (resp.status != 200) {
        return;
    }

    $(".f_register").style.display = "none";
    $(".f_finish").style.display = "block";
};
