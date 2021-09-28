function doGet(){
  var bg = getBackgroundActive()

  var template = HtmlService.createTemplateFromFile('index')
  template.bg = bg
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
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


function updateCardInfo(infos){
  row = findRow(infos.dataCriacao)

  aba.getRange(row,2).setValue(infos.titulo)
  aba.getRange(row,3).setValue(infos.descricao)
}


function deleteCard(dataCriacao){
  row = findRow(dataCriacao)
  aba.deleteRow(row)
}

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

function setBackground(bgActive){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var bg = dados.map(function(r){return r[0];});

  for(let i=1;i<bg.length;i++){
    if(bg[i] == bgActive) aba.getRange(i+1,2).setValue(true)
    else aba.getRange(i+1,2).setValue(false)
  }
}

function deleteBackground(bg){
  let aba = planilha.getSheetByName("Temas"),
  dados = aba.getRange(1,1,aba.getLastRow(),1).getValues()

  var bgs = dados.map(function(r){return r[0];});

  for(let i=1;i<bgs.length;i++){
    if(bgs[i] == bg) aba.deleteRow(i+1)
  }
}


function createBackground(bg,use){
  let aba = planilha.getSheetByName("Temas")
  aba.appendRow([bg,false])
  
  if(use) setBackground(bg)
}