cl("Conectando ao servidor SSE...");

// URL aponta para a rota que vamos criar
const evtSource = new EventSource("App/Controllers/Tools/ServerSSE/ServerSSE::stream");

evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Novo arquivo:", data.filename);
};

evtSource.onerror = (err) => {
    console.error("EventSource failed:", err);
    evtSource.close();
};

// const evtSource = new EventSource("App/Controllers/Tools/ServerSSE/ServerSSE/stream");

// evtSource.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     console.log("Novo arquivo:", data.filename);
// };
