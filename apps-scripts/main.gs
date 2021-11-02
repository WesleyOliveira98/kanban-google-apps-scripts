//Função doGet é padrão do Google para inicialização da sua aplicação através do link implantado
function doGet(){
  var bg = getBackgroundActive()

  //Cria template através do arquivo index.html
  var template = HtmlService.createTemplateFromFile('index')

  //Essa template é um objeto e pode receber propriedades que será carregadas na aplicação e você conseguirá usar o scriptlets do Google para fazer interpolação de dados em seu HTML
  template.bg = bg

  //Retorna a template, setando o titulo e permitando que ela será colocada em um iframe
  return template.evaluate()
    .setTitle("Kanban Web App")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

//Função que permite incluir arquivos HTML ao seu index, usamos ela para separar o CSS e o Javascript do HTML
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

//Variaveis globais com as informações da sua planilha
var planilha = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1Oo0wQBHwNjy9TUXkvpJKeWcozGXW20EJY7uJu0Dkjn0/edit#gid=0")
var aba = planilha.getSheetByName("Cards")


//Função puxa informações dos cards lá na nossa planilha
function getCards(){
  var dados = aba.getRange(1,1,aba.getLastRow(),11).getValues()

  var dataCriacao = dados.map(function(r){return r[0];});
  var titulo = dados.map(function(r){return r[1];});
  var descricao = dados.map(function(r){return r[2];});
  var status = dados.map(function(r){return r[3];});
  var agendado = dados.map(function(r){return r[4];});
  var inicioEvento = dados.map(function(r){return r[5];});
  var fimEvento = dados.map(function(r){return r[6];});
  var participantes = dados.map(function(r){return r[7];});
  var listaParticipantes = dados.map(function(r){return r[8];});
  var inicio = dados.map(function(r){return r[9];});
  var fim = dados.map(function(r){return r[10];});

  var cards = {
    backlog: [],
    iniciados: [],
    concluidos: []
  }

  for(let i=0;i<dataCriacao.length;i++){
    var card = {
      dataCriacao: dataCriacao[i].toLocaleString("pt-br"),
      titulo: titulo[i],
      descricao: descricao[i],
      status: status[i],
      agendado: agendado[i],
      inicioEvento: inicioEvento[i].toLocaleString("pt-br"),
      fimEvento: fimEvento[i].toLocaleString("pt-br"),
      participantes: participantes[i],
      listaParticipantes: listaParticipantes[i],
      inicio: inicio[i].toLocaleString("pt-br"),
      fim: fim[i].toLocaleString("pt-br")
    }

    if(status[i] == "Backlog") cards.backlog.push(card)
    else if(status[i] == "Iniciado") cards.iniciados.push(card)
    else if(status[i] == "Concluido") cards.concluidos.push(card)
  }

  Logger.log(cards)

  return cards
}

//Função encontra em qual linha está o nosso card
function findRow(dataCriacao){
  var dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var datasDeCriacao = dados.map(function(r){return r[0];});
  for(let i=0;i<datasDeCriacao.length;i++){
    if(dataCriacao == datasDeCriacao[i].toLocaleString("pt-br"))var row = i+1
  }

  return row
}

//Função "movimenta" o card de coluna
function moveCard(dataCriacao,status,typeDate,date){
  var row = findRow(dataCriacao)

  if(typeDate == "start") var column = 10
  else var column = 11

  if(date) var data = new Date()
  else var data = ""

  aba.getRange(row,4).setValue(status)
  aba.getRange(row,column).setValue(data) 
}

//Função para criar evento no Google Calendar
function createCalendar(infos){
  CalendarApp.getDefaultCalendar().createEvent(infos.titulo,
  new Date(infos.start),
  new Date(infos.end),
  {description: infos.descricao,
  guests: infos.guests,
  sendInvites: true});
}

//Função para salvar um novo card
function salvar(infos){
  let inicioEvento = ""
  let fimEvento = ""

  if(infos.start) inicioEvento = new Date(infos.start)
  if(infos.end) fimEvento = new Date(infos.end)

  aba.appendRow([new Date(),
  infos.titulo,
  infos.descricao,
  "Backlog",
  infos.agendado,
  inicioEvento,
  fimEvento,
  infos.participantes,
  infos.guests])
}

//Função para atualizar os dados do card
function updateCardInfo(infos){
  row = findRow(infos.dataCriacao)

  aba.getRange(row,2).setValue(infos.titulo)
  aba.getRange(row,3).setValue(infos.descricao)
}

//Função para deletar um card da planilha
function deleteCard(dataCriacao){
  row = findRow(dataCriacao)
  aba.deleteRow(row)
}

//Função puxa as estatisticas dos cards
function getStats(){
  let dados = aba.getRange(2,1,aba.getLastRow(),11).getValues()
  return {
    criacao: dados.map(function(r){return r[0].toLocaleString("en-us")}),
    iniciados: dados.map(function(r){return r[9].toLocaleString("en-us")}),
    finalizados: dados.map(function(r){return r[10].toLocaleString("en-us")}),
    eventos: dados.map(function(r){if(r[4]) return r[0].toLocaleString("en-us")}),
    eventosWithGuests: dados.map(function(r){if(r[4] && r[7]) return r[0].toLocaleString("en-us")})
  } 
}

//Função busca o tema que está ativo
function getBackgroundActive(){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),2).getValues(),
  background = "white"

  var bg = dados.map(function(r){return r[0];});
  var active = dados.map(function(r){return r[1];});

  for(let i=0;i<bg.length;i++){
    if(active[i]) background = bg[i]
  }

  return background
}

//Função retorna a lista de temas salvos na planilha
function getBackgroundList(){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),2).getValues(),
  res = [];

  dados.forEach((dado)=>{
    let obj = {
      bg: dado[0],
      active: dado[1]
    }
    if(dados.indexOf(dado)>0)res.push(obj)
  })

  return res
}

//Função salva um tema como tema ativo
function setBackground(bgActive){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var bg = dados.map(function(r){return r[0];});

  for(let i=1;i<bg.length;i++){
    if(bg[i] == bgActive) aba.getRange(i+1,2).setValue(true)
    else aba.getRange(i+1,2).setValue(false)
  }
}

//Função apaga um tema da planilha
function deleteBackground(bg){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var bgs = dados.map(function(r){return r[0];});

  for(let i=1;i<bgs.length;i++){
    if(bgs[i] == bg) aba.deleteRow(i+1)
  }
}

//Função adiciona um novo tema e salva como tema ativo
function createBackground(bg,use){
  let aba = planilha.getSheetByName("Temas")
  aba.appendRow([bg,false])
  
  if(use) setBackground(bg)
}