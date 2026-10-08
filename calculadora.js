const MINHA_API_KEY = "sua_chave_secreta_aqui";

let apiResponseData = null; 
let xmlContentString = ""; 

document.getElementById('imcForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const waist = parseFloat(document.getElementById('waist').value);
    const hip = parseFloat(document.getElementById('hip').value);
    const sex = document.getElementById('sex').value;
    
    const btnSubmit = document.getElementById('btnSubmit');
    const loadingSection = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');

   
    btnSubmit.disabled = true;
    resultContainer.classList.add('hidden'); 
    loadingSection.classList.remove('hidden'); 

    try {
      
        const responseData = await fetchBmiApi(weight, height, waist, hip, sex, MINHA_API_KEY);
        
        apiResponseData = responseData;
        xmlContentString = responseData.xml_interno; 

        document.getElementById('imcValue').innerText = responseData.imc;
        
        const statusElement = document.getElementById('imcStatus');
        statusElement.innerText = responseData.classificacao;
        statusElement.style.color = responseData.corBadge;
        
        document.getElementById('imcMessage').innerText = responseData.mensagem;

        document.getElementById('rcqValue').innerText = responseData.rcq;
        
        const rcqStatusElement = document.getElementById('rcqStatus');
        rcqStatusElement.innerText = responseData.classificacaoRcq;
        rcqStatusElement.style.color = responseData.corBadgeRcq;

        loadingSection.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } catch (error) {
        loadingSection.classList.add('hidden');
        alert(error.message);
    } finally {
        btnSubmit.disabled = false;
    }
});

document.getElementById('btnDownloadXml').addEventListener('click', function() {
    if (!apiResponseData) return;

    const textoRelatorio = `=========================================
       RELATÓRIO DE SAÚDE - IMC & RCQ
=========================================
Data/Hora: ${new Date(apiResponseData.timestamp).toLocaleString('pt-BR')}
Status da Requisição: ${apiResponseData.status}

DADOS DE ENTRADA:
- Peso Informado: ${apiResponseData.dados_origem.peso} kg
- Altura Informada: ${apiResponseData.dados_origem.altura} m
- Cintura Informada: ${apiResponseData.dados_origem.cintura} cm
- Quadril Informado: ${apiResponseData.dados_origem.quadril} cm
- Sexo: ${apiResponseData.dados_origem.sexo === 'm' ? 'Masculino' : 'Feminino'}

RESULTADO DO DIAGNÓSTICO:
- IMC Calculado: ${apiResponseData.imc} (${apiResponseData.classificacao})
- RCQ Calculada: ${apiResponseData.rcq} (${apiResponseData.classificacaoRcq})

RECOMENDAÇÃO:
${apiResponseData.mensagem}
=========================================`;

    const blob = new Blob([textoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_saude_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

async function fetchBmiApi(weight, height, waist, hip, sex, apiKey) {
    if (!apiKey || apiKey !== "sua_chave_secreta_aqui") {
        throw new Error("Erro 401 (Unauthorized): Chave de API externa inválida.");
    }

   
    const imcCalculado = (weight / (height * height)).toFixed(1);
    const rcqCalculada = (waist / hip).toFixed(2);
    
    let classeImc = "";
    let corImc = "";
    if (imcCalculado < 18.5) { classeImc = "Abaixo do peso"; corImc = "#fbef53"; }
    else if (imcCalculado <= 24.9) { classeImc = "Peso normal"; corImc = "#4ade80"; }
    else if (imcCalculado <= 29.9) { classeImc = "Sobrepeso"; corImc = "#fb923c"; }
    else { classeImc = "Obesidade"; corImc = "#ef4444"; }
    
    let classeRcq = "Baixo Risco";
    if (sex === "m" && rcqCalculada >= 0.90) classeRcq = "Alto Risco";
    if (sex === "f" && rcqCalculada >= 0.85) classeRcq = "Alto Risco";

    const mockupResponseObject = {
        status: 200,
        imc: imcCalculado,
        classificacao: classeImc,
        corBadge: corImc,
        rcq: rcqCalculada,
        classificacaoRcq: classeRcq,
        corBadgeRcq: classeRcq === "Baixo Risco" ? "#4ade80" : "#ef4444",
        mensagem: "Processado com sucesso.",
        timestamp: new Date().toISOString(),
        dados_origem: { peso: weight, altura: height, cintura: waist, quadril: hip, sexo: sex },
        xml_interno: "<?xml version=\"1.0\" encoding=\"UTF-8\"?><modulo_externo></modulo_externo>"
    };

    const jsonString = JSON.stringify(mockupResponseObject);
    const blobSimulado = new Blob([jsonString], { type: 'application/json' });
    const urlSimulada = URL.createObjectURL(blobSimulado);

    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
        const response = await fetch(urlSimulada);
        return await response.json();
    } finally {
        URL.revokeObjectURL(urlSimulada);
    }
}
