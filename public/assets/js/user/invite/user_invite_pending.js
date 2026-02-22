document.addEventListener("DOMContentLoaded", () => {
    $('.table').onclick = e => send(e.target.parentElement.parentElement);
});

const send = e => {
    const cell = e.dataset.cell;
    const link = e.dataset.link;
    const message = `Clique no link para se cadastrar no sistema do Instituto Arc. Caso o link não esteja clicável, você deverá primeiro salvar esse numero em seus contatos ou copia-lo e colar no navegador. \n\n${baseURL}inv/?k=${link}`;


    $sendZap(cell, message, 'api');
};