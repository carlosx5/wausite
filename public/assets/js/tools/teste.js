document.addEventListener("DOMContentLoaded", () => {
    // $('.container').addEventListener('click', event => events.click(event));
});

//:Conexão com bluetooth ao clicar em ".botao"
document.querySelector('.botao').addEventListener('click', async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });
        console.log('Dispositivo selecionado:', device.name);
    } catch (error) {
        console.error('Erro ao conectar:', error);
    }
});


const janela = document.getElementById('janela');
let offsetX = 0;
let offsetY = 0;
let arrastando = false;

janela.addEventListener('mousedown', (e) => {
    arrastando = true;
    // Calcula a distância entre o mouse e a posição atual da janela
    offsetX = e.clientX - janela.offsetLeft;
    offsetY = e.clientY - janela.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (arrastando) {
        // Atualiza a posição da janela conforme o movimento do mouse
        janela.style.left = (e.clientX - offsetX) + 'px';
        janela.style.top = (e.clientY - offsetY) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    arrastando = false;
});