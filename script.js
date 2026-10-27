
const formulario = document.querySelector('#formulario');
const campoMateria = document.querySelector('#materia');
const campoTipo = document.querySelector('#tipo');
const campoData = document.querySelector('#data');
const erro = document.querySelector('#erro');

const filtro = document.querySelector('#filtro');
const lista = document.querySelector('#lista-entregas');
const mensagemVazia = document.querySelector('#mensagem-vazia');

const totalPendentes = document.querySelector('#total-pendentes');
const proximaEntrega = document.querySelector('#proxima-entrega');



const NOMES_TIPO = {
    prova: 'Prova',
    trabalho: 'Trabalho',
    apresentacao: 'Apresentação'
};


let entregas = [
    { id: 1, materia: 'Português',  tipo: 'trabalho',     data: '2026-10-20', feita: true },
    { id: 2, materia: 'Matemática', tipo: 'prova',        data: '2026-10-28', feita: false },
    { id: 3, materia: 'Inglês',     tipo: 'apresentacao', data: '2026-10-30', feita: false },
    { id: 4, materia: 'História',   tipo: 'trabalho',     data: '2026-11-04', feita: false }
];




function formatarData(dataISO) {
    const partes = dataISO.split('-'); 
    return partes[2] + '/' + partes[1];
}


function hojeISO() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return hoje.getFullYear() + '-' + mes + '-' + dia;
}


function ordenar(lista) {
    return [...lista].sort(function (a, b) {
        return a.data.localeCompare(b.data);
    });
}


function passaNoFiltro(entrega) {
    const escolha = filtro.value;

    if (escolha === 'tudo') return true;
    if (escolha === 'pendentes') return !entrega.feita;
    if (escolha === 'feitas') return entrega.feita;
    return entrega.tipo === escolha;   
}



function criarBotao(texto, acao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao-pequeno';
    botao.textContent = texto;
    botao.dataset.acao = acao;   
    return botao;
}


function criarItem(entrega) {
    const li = document.createElement('li');
    li.className = 'entrega tipo-' + entrega.tipo;
    li.dataset.id = entrega.id;

    const atrasada = !entrega.feita && entrega.data < hojeISO();
    if (entrega.feita) li.classList.add('feita');
    if (atrasada) li.classList.add('atrasada');

    const data = document.createElement('span');
    data.className = 'entrega-data';
    data.textContent = formatarData(entrega.data);

    const texto = document.createElement('div');
    texto.className = 'entrega-texto';

    const materia = document.createElement('strong');
    materia.textContent = entrega.materia;

    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta';
    etiqueta.textContent = NOMES_TIPO[entrega.tipo];

    texto.append(materia, etiqueta);

    if (atrasada) {
        const atraso = document.createElement('span');
        atraso.className = 'etiqueta etiqueta-atraso';
        atraso.textContent = 'Atrasada';
        texto.append(atraso);
    }

    const acoes = document.createElement('div');
    acoes.className = 'entrega-acoes';
    acoes.append(
        criarBotao(entrega.feita ? 'Reabrir' : 'Feita', 'alternar'),
        criarBotao('Apagar', 'apagar')
    );

    li.append(data, texto, acoes);
    return li;
}

function renderizarLista() {
    const visiveis = ordenar(entregas).filter(passaNoFiltro);

    lista.innerHTML = '';   
    visiveis.forEach(function (entrega) {
        lista.appendChild(criarItem(entrega));
    });

    mensagemVazia.hidden = visiveis.length > 0;
}

function renderizarResumo() {
    const pendentes = ordenar(entregas).filter(function (entrega) {
        return !entrega.feita;
    });

    totalPendentes.textContent = pendentes.length;

    if (pendentes.length === 0) {
        proximaEntrega.textContent = 'Nada pendente';
    } else {
        const proxima = pendentes[0];   
        proximaEntrega.textContent = proxima.materia + ' — ' + formatarData(proxima.data);
    }
}


function renderizar() {
    renderizarLista();
    renderizarResumo();
}




formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();   

    const materia = campoMateria.value.trim();
    const tipo = campoTipo.value;
    const data = campoData.value;

    if (!materia || !tipo || !data) {
        erro.textContent = 'Preencha matéria, tipo e data.';
        return;
    }

    erro.textContent = '';

    entregas.push({
        id: Date.now(),   
        materia: materia,
        tipo: tipo,
        data: data,
        feita: false
    });

    formulario.reset();
    campoMateria.focus();
    renderizar();
});


lista.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;

    const id = Number(botao.closest('li').dataset.id);

    if (botao.dataset.acao === 'alternar') {
        const entrega = entregas.find(function (item) {
            return item.id === id;
        });
        entrega.feita = !entrega.feita;   
    }

    if (botao.dataset.acao === 'apagar') {
        entregas = entregas.filter(function (item) {
            return item.id !== id;   
        });
    }

    renderizar();
});


filtro.addEventListener('change', renderizarLista);

renderizar();