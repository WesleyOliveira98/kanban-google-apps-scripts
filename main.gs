function doGet(){
  var template = HtmlService.createTemplateFromFile('index')
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

var planilha = SpreadsheetApp.openById("1fzAksn4JUiWXo3D8EqwKblJrNKaxgL_eLy3S8cxB_nc")
var aba = planilha.getSheetByName("Cards")

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

function findRow(dataCriacao){
  var dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var datasDeCriacao = dados.map(function(r){return r[0];});
  for(let i=0;i<datasDeCriacao.length;i++){
    if(dataCriacao == datasDeCriacao[i].toLocaleString("pt-br"))var row = i+1
  }

  return row
}

function moveCard(dataCriacao,status,typeDate,date){
  var row = findRow(dataCriacao)

  if(typeDate == "start") var column = 10
  else var column = 11

  if(date) var data = new Date()
  else var data = ""

  aba.getRange(row,4).setValue(status)
  aba.getRange(row,column).setValue(data) 
}

function createCalendar(infos){
  CalendarApp.getDefaultCalendar().createEvent(infos.titulo,
  new Date(infos.start),
  new Date(infos.end),
  {description: infos.descricao,
  guests: infos.guests,
  sendInvites: true});
}


function salvar(infos){
  aba.appendRow([new Date(),
  infos.titulo,
  infos.descricao,
  "Backlog",
  infos.agendado,
  new Date(infos.start),
  new Date(infos.end),
  infos.participantes,
  infos.guests])
}