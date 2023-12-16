// Variáveis globais
var coordenadasIniciais = { lat: -22.9714, lng: -43.1823 }; // Coordenadas iniciais para o mapa (Rio de Janeiro)
var map; // Variável para o mapa do Google Maps
var marcadorAtual; // Marcador atual no mapa
var inputCEP, inputEndereco, btnBuscar; // Elementos do DOM: campos de entrada e botão de busca

// Função de inicialização do mapa do Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: coordenadasIniciais,
        zoom: 12
    });
}

// Função para buscar informações de um CEP
function buscarCEP(CEP) {
    const url = `https://viacep.com.br/ws/${CEP}/json/`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha na requisição: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.erro) {
                throw new Error('CEP não encontrado, por favor insira um válido.');
            }
            exibirEndereco(data); // Exibe o endereço obtido do CEP
            const enderecoCompleto = `${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`;
            atualizarMapaComEndereco(enderecoCompleto); // Atualiza o mapa com o endereço
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            exibirMensagemErro('CEP não encontrado, por favor insira um válido.');
            exibirMensagemAdicional();
        });
}

// Função para buscar informações de um endereço
function buscarEndereco(endereco) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': endereco }, function (results, status) {
        if (status == 'OK') {
            // Se a geocodificação foi bem-sucedida
            exibirEnderecoGeocodificado(results[0].formatted_address); // Exibe o endereço formatado
            atualizarMapaComEndereco(results[0].formatted_address); // Atualiza o mapa com o endereço
        } else {
            // Se houver um erro na geocodificação
            console.error('Erro na geocodificação:', status);
            exibirMensagemErro('Endereço não encontrado, por favor insira um válido.');
            exibirMensagemAdicional();
        }
    });
}

// Função para exibir o endereço obtido do CEP
function exibirEndereco(data) {
    const tagP = document.createElement('p');
    const main = document.querySelector('main');
    main.append(tagP);

    // Construindo e formatando o endereço obtido do CEP
    let enderecoFormatado = `${data.logradouro || ''} - ${data.bairro || ''}<br>`;
    enderecoFormatado += `${data.localidade || ''} - ${data.uf || ''}<br>`;
    enderecoFormatado += `Brasil`;

    tagP.innerHTML = enderecoFormatado.trim();
    desabilitarFormulario();
    exibirMensagemNovaBusca();
}

// Função para exibir o endereço obtido pela geocodificação
function exibirEnderecoGeocodificado(endereco) {
    const tagP = document.createElement('p');
    const main = document.querySelector('main');
    main.append(tagP);

    // Dividindo o endereço em partes
    const partesEndereco = endereco.split(', ');

    // Reconstruindo o endereço
    let enderecoFormatado = `${partesEndereco[0] || ''}`;
    if (partesEndereco[1]) {
        enderecoFormatado += ` ${partesEndereco[1]}`;
    }
    enderecoFormatado += `<br>${partesEndereco[2] || ''}`;
    if (partesEndereco[3]) {
        enderecoFormatado += `<br>${partesEndereco[3]}`;
    }

    // Verifica se 'Brasil' já está incluído no endereço
    if (!enderecoFormatado.includes("Brasil")) {
        enderecoFormatado += "<br>Brasil";
    }

    tagP.innerHTML = enderecoFormatado.trim();
    desabilitarFormulario();
    exibirMensagemNovaBusca();
}

// Função para exibir mensagens de erro
function exibirMensagemErro(mensagem) {
    const tagP = document.createElement('p');
    tagP.classList.add('mensagem-erro', 'mensagem-erro-menor'); // Adiciona classes à mensagem de erro
    const main = document.querySelector('main');
    main.append(tagP);
    tagP.innerHTML = mensagem;
}

// Função para exibir mensagem adicional e desabilitar formulário
function exibirMensagemAdicional() {
    const tagP = document.createElement('p');
    tagP.classList.add('mensagem-adicional'); // Classe para a mensagem adicional
    tagP.innerHTML = "Clique no botão 'Limpar' e tente novamente.";
    const main = document.querySelector('main');
    main.append(tagP);
    desabilitarFormulario(); // Desabilita o formulário após exibir a mensagem adicional
}

// Função para exibir a mensagem adicional para nova busca
function exibirMensagemNovaBusca() {
    const tagP = document.createElement('p');
    tagP.classList.add('mensagem-adicional'); // Classe para a mensagem adicional
    tagP.innerHTML = "Para realizar uma nova busca, clique no botão 'Limpar'.";
    const main = document.querySelector('main');
    main.append(tagP);
}

// Função para desabilitar os campos de entrada e o botão de busca
function desabilitarFormulario() {
    inputCEP.disabled = true;
    inputEndereco.disabled = true;
    btnBuscar.disabled = true;
}

// Função para reabilitar os campos de entrada e o botão de busca
function reabilitarFormulario() {
    inputCEP.disabled = false;
    inputEndereco.disabled = false;
    btnBuscar.disabled = false;
    limparMensagensErro(); // Limpa as mensagens de erro
}

// Função para limpar mensagens de erro e adicional
function limparMensagensErro() {
    const mensagensErro = document.querySelectorAll('main .mensagem-erro, .mensagem-adicional');
    mensagensErro.forEach(mensagem => mensagem.remove());
}

// Função para atualizar o mapa com um endereço específico
function atualizarMapaComEndereco(endereco) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': endereco }, function (results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);

            if (marcadorAtual) {
                marcadorAtual.setMap(null);
            }
            marcadorAtual = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            console.error('Erro na geocodificação:', status);
        }
    });
}

// Inicialização dos elementos do DOM após o carregamento da página
document.addEventListener('DOMContentLoaded', function () {
    inputCEP = document.querySelector('#CEP');
    inputEndereco = document.querySelector('#endereco');
    btnBuscar = document.querySelector('.btBuscar');

    const placeholderCEP = 'Digite o CEP';
    const placeholderEndereco = 'Digite o Endereço';

    // Eventos para manipular os placeholders
    inputCEP.addEventListener('focus', function () {
        this.placeholder = '';
    });
    inputCEP.addEventListener('blur', function () {
        this.placeholder = placeholderCEP;
    });

    inputEndereco.addEventListener('focus', function () {
        this.placeholder = '';
    });
    inputEndereco.addEventListener('blur', function () {
        this.placeholder = placeholderEndereco;
    });

    // Evento de submit do formulário
    const formulario = document.querySelector('form');
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();
        const CEP = inputCEP.value;
        const endereco = inputEndereco.value;

        // Verificando se ambos os campos estão preenchidos
        if (CEP.trim() && endereco.trim()) {
            exibirMensagemErro('Apenas um campo deve ser buscado por vez.');
            exibirMensagemAdicional(); // Exibe a mensagem adicional
            return;
        }

        // Continua com a busca se apenas um dos campos estiver preenchido
        if (CEP.trim()) {
            buscarCEP(CEP);
        } else if (endereco.trim()) {
            buscarEndereco(endereco);
        } else {
            exibirMensagemErro('Por favor, insira um CEP ou um Endereço.');
            exibirMensagemAdicional(); // Exibe a mensagem adicional para este caso também
        }
    });

    // Evento de clique para o botão 'Limpar'
    const btnLimpar = document.querySelector('.btLimpar');
    btnLimpar.addEventListener('click', function () {
        // Limpa os campos e redefine o mapa
        inputCEP.value = '';
        inputEndereco.value = '';
        map.setCenter(coordenadasIniciais);
        map.setZoom(12);

        if (marcadorAtual) {
            marcadorAtual.setMap(null);
            marcadorAtual = null;
        }

        // Remove todos os resultados exibidos
        const resultados = document.querySelectorAll('main p');
        resultados.forEach(resultado => resultado.remove());

        reabilitarFormulario(); // Reabilita o formulário para nova busca
    });
});
