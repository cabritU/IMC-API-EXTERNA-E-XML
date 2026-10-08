const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.post('/v1/health-check', (req, res) => {
    
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader && authHeader.split(' ')[1]; 

    
    if (!apiKey || apiKey !== "sua_chave_secreta_aqui") {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Erro 401: Chave de API externa inválida ou ausente no cabeçalho."
        });
    }

  
    const { weight, height, waist, hip, sex } = req.body;

    if (!weight || !height || !waist || !hip || !sex) {
        return res.status(400).json({
            status: 400,
            error: "Bad Request",
            message: "Erro 400: Parâmetros obrigatórios ausentes no corpo da requisição."
        });
    }

   
    const imc = (weight / (height * height)).toFixed(1);
    const rcq = (waist / hip).toFixed(2);

    let classificacao = "";
    let corBadge = "";
    let mensagem = "";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
        corBadge = "#fbef53";
        mensagem = "Atenção do Servidor: Peso abaixo do recomendado.";
    } else if (imc <= 24.9) {
        classificacao = "Peso normal";
        corBadge = "#4ade80";
        mensagem = "Parabéns! Peso considerado ideal segundo parâmetros de referência.";
    } else if (imc <= 29.9) {
        classificacao = "Sobrepeso";
        corBadge = "#fb923c";
        mensagem = "Indicação de sobrepeso. Atividades físicas e ajustes alimentares podem ajudar.";
    } else {
        classificacao = "Obesidade";
        corBadge = "#ef4444";
        mensagem = "Classificado como obesidade. Recomendamos acompanhamento especializado.";
    }

    let classificacaoRcq = "";
    let corBadgeRcq = "";

    if (sex === "m") {
        if (rcq < 0.90) {
            classificacaoRcq = "Baixo Risco";
            corBadgeRcq = "#4ade80";
        } else if (rcq <= 1.0) {
            classificacaoRcq = "Risco Moderado";
            corBadgeRcq = "#fb923c";
        } else {
            classificacaoRcq = "Alto Risco";
            corBadgeRcq = "#ef4444";
        }
    } else {
        if (rcq < 0.80) {
            classificacaoRcq = "Baixo Risco";
            corBadgeRcq = "#4ade80";
        } else if (rcq <= 0.85) {
            classificacaoRcq = "Risco Moderado";
            corBadgeRcq = "#fb923c";
        } else {
            classificacaoRcq = "Alto Risco";
            corBadgeRcq = "#ef4444";
        }
    }

    const timestamp = new Date().toISOString();

   
    const xmlSchema = `<?xml version="1.0" encoding="UTF-8"?>
<relatorio_saude_externo>
    <dados_origem>
        <peso>${weight}</peso>
        <altura>${height}</altura>
        <cintura>${waist}</cintura>
        <quadril>${hip}</quadril>
        <sexo>${sex}</sexo>
    </dados_origem>
    <diagnostico>
        <imc>${imc}</imc>
        <rcq>${rcq}</rcq>
    </diagnostico>
</relatorio_saude_externo>`;

   
    res.json({
        status: 200,
        imc,
        classificacao,
        corBadge,
        rcq,
        classificacaoRcq,
        corBadgeRcq,
        mensagem,
        timestamp,
        dados_origem: { weight, height, waist, hip, sex },
        xml_interno: xmlSchema
    });
});


app.listen(PORT, () => {
    console.log(`[SERVER] API Externa simulada rodando em http://localhost:${PORT}`);
});
