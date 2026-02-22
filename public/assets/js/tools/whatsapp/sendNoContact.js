document.addEventListener("DOMContentLoaded", () => {
    $('.btnSend').addEventListener('click', go.zap);
});

const go = {
    zap() {
        (async function () {
            const resp = await $fetch({
                url: 'tools/whatsapp/sendNoContact/sendZap',
                par: {
                    message: $('#message').value,
                    cell: $('#cell').value,
                },
                fnName: 'ENVIA ZAP #627',
            });
        }());
    },
};