function doGet(){
  var template = HtmlService.createTemplateFromFile('index')
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
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
  var planilha = SpreadsheetApp.openById("1fzAksn4JUiWXo3D8EqwKblJrNKaxgL_eLy3S8cxB_nc")
  var aba = planilha.getSheetByName("Cards")

  aba.appendRow([new Date(),infos.titulo,infos.descricao,"Backlog",infos.agendado,new Date(infos.start),new Date(infos.end),infos.participantes,infos.guests])
}