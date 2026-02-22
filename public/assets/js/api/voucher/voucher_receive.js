const v = {
    voucherId: 0
};

document.addEventListener("DOMContentLoaded", () => {
    v.voucherId = $('.voucher_info').dataset.voucher_number;

    $('.btn_schedule').onclick = () => doSchedule();
});

const doSchedule = async () => {
    $('.f_contentShedule').style.display = 'none';
    $('.f_contentConfirm').style.display = 'flex';

    const formData = new FormData();
    formData.append('voucherId', v.voucherId);

    const resp = await $fetch({
        url: 'api/voucher/voucher_receive/schedule',
        par: formData,
        overlay: false,
        fnName: 'AGENDAMENTO #603',
    });
};