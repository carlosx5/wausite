ls.init("none");

document.addEventListener("DOMContentLoaded", () => {
    $trigger("[name=name]", "blur");

    //MASK
    mask.phone.init("[name=cell]");

    $(".btnSend").onclick = () => btnSend();
    $(".btnCancel").onclick = () => btnCancel();
    $(".btnBack").onclick = () => btnBack();
});

const btnSend = async () => {
    const cell = $("[name=cell]").value;

    const data = {
        table: g.acting,
        name: $("[name=name]").value,
        cell: cell,
        id_clinic: $("[name=id_clinic]").value,
    };

    //FAZ PRÉ-CADASTRO E ENVIA CONVITE POR ZAP
    const resp = await $fetch({
        url: "user/invite/user_invite_send/sendInvite",
        par: { data },
        fnName: "ENVIA CONVITE #573",
        messageType: 2,
    });

    if (resp.status != 200) return;

    $(".f_send").style.display = "none";
    $(".f_finish").style.display = "block";
};

const btnCancel = () => {
    window.location.href = `${baseURL}home`;
};

const btnBack = () => {
    $(".f_finish").style.display = "none";
    $(".f_send").style.display = "block";
};

(function initSelectClinic() {
    if (typeof select_clinic === "undefined") {
        select_clinic = ajaxSelect();
    }
    select_clinic.init({
        div: "#as_clinic",
        url: "clinic/register/find/findClinic",
        fields: "col1",
        callback: (e) => {
            $("[name=id_clinic]").value = e.id;
            $("[name=nm_clinic]").value = e.txt1;
        },
    });
})();
