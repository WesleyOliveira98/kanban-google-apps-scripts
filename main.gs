function doGet(){
  var template = HtmlService.createTemplateFromFile('index')
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}
