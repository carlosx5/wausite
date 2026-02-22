const v = {
    voucherId: 0,
    dateTime: 0
};

document.addEventListener("DOMContentLoaded", () => {
    mask.phone.init('#cel');
    mask.currency.init({ element: '.val' });

    makeVoucherNumber();

    $('.btnSend').onclick = () => send();
    $('.btnBack').onclick = () => btnBack();
    $i('procedureId').onchange = () => getProcedure();
    $i('vl_discount').onchange = e => changeDiscount(e.target.value);
});

const makeVoucherNumber = () => {
    const dateTime = $date.timestamp().toString().slice(0, 13);
    v.voucherId = mask.dinamic(dateTime, '####.####.####');

    $('#voucher').textContent = v.voucherId;
};

const send = async () => {
    const data = {
        voucherId: v.voucherId,
        name: $i('name').value,
        cel: $i('cel').value,
        procedureId: $i('procedureId').value,
        vl_table: $i('vl_table').value,
        vl_discount: $i('vl_discount').value,
        vl_total: $i('vl_total').value,
    };

    const resp = await $fetch({
        url: 'api/voucher/voucher_send/send',
        par: { data },
        overlay: false,
        fnName: 'ENVIA VOUCHER #602',
    });

    if (resp.status != 200) return;

    $('.page1').classList.remove('on');
    $('.page2').classList.add('on');
    setTimeout(() => $('.page2').style.opacity = '1', 10);
};

const getProcedure = async () => {
    const procedureId = $i('procedureId').value;

    const resp = await $fetch({
        url: 'api/voucher/voucher_send/getProcedure',
        par: { procedureId },
        overlay: false,
        fnName: 'BUSCA PROCEDIMENTO #604',
    });

    $change('#vl_table', resp.procedure.vl_table);
    $change('#vl_discount', resp.procedure.vl_table);
    $change('#vl_total', resp.procedure.vl_table - resp.procedure.vl_table);
};

const changeDiscount = value => {
    const discount = $numberOnly(value);
    const table = $numberOnly($i('vl_table').value);
    $change('#vl_total', table - discount);
};

const btnBack = () => {
    makeVoucherNumber();

    $('.page1').classList.add('on');
    $('.page2').classList.remove('on');
    setTimeout(() => $('.page2').style.opacity = '0', 100);
};