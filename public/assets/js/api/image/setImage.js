const baseURL = location.hostname == "localhost" ? `http://localhost/wausaude/public/` : `https://${location.hostname}/`;

const cameraBox = document.querySelector(".camera-box");
const finishedBox = document.querySelector(".finished-box");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const btnCapture = document.getElementById("btnCapture");
const btnStop = document.getElementById("btnStop");
const btnTeste = document.getElementById("btnTeste");
let currentStream = null;

btnCapture.addEventListener("click", () => sendImage());
btnStop.addEventListener("click", () => stopCamera());
// btnTeste.addEventListener("click", () => teste());

startCamera();

//:Aciona e inicia camera
function startCamera() {
    navigator.mediaDevices
        .getUserMedia({
            video: { facingMode: { exact: "environment" } },
        })
        .then((stream) => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch((err) => {
            //:Fallback: tenta abrir a frontal se não achar traseira
            return navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                currentStream = stream;
                video.srcObject = stream;
            });
        });
}

//:Para todas as tracks de vídeo e áudio
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        currentStream = null;
    }

    cameraBox.style.display = "none";
    finishedBox.style.display = "flex";
}

function flash() {
    const flash = document.querySelector(".flash");

    flash.classList.add("start");

    setTimeout(() => flash.classList.remove("start"), 200);
}

//:Envia imagem
function sendImage() {
    flash();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    //:Converte o canvas para Blob (arquivo)
    canvas.toBlob(function (blob) {
        const formData = new FormData();
        formData.append("patientId", 204);
        // formData.append("method", method);
        formData.append("fotos[]", blob, "foto.jpg");

        fetch(`${baseURL}apiPicture`, {
            method: "POST",
            headers: {
                // Pega o valor da variável global definida no seu HTML (View)
                "X-CSRF-TOKEN": window.CSRF_TOKEN,
            },
            body: formData,
        })
            .then((response) => response.text())
            .then((result) => {
                result = JSON.parse(result);
                console.log("result: ", result);
                // document.querySelector(".console").innerHTML = `Status: ${result.status} - Mensagem: ${result.dev}`;
                if (result.status == 800) location.reload();
            })
            .catch((error) => console.error("Erro ao enviar imagem:", error));
    }, "image/jpeg");
}
