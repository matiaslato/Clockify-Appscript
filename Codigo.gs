function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Datos del usuario', functionName: 'getUserInfo'},
    {name: 'Enviar tareas', functionName: 'sendTask'},
    {name: 'Archivar Tareas', functionName: 'getAllProducts'},
  ];
  spreadsheet.addMenu('Acciones', menuItems);
}

/*GET USER DATA INFO*/

/*GET BASIC INFORMATION*/
function getUserInfo() {
  const url = 'https://api.clockify.me/api/v1/user';
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("DATOS");
  const token = sheetData.getRange('DATOS!$B$1').getValue();
  var options = {
    'method' : 'GET',
    'contentType': 'application/json',
    'headers': {
      'X-Api-Key' : token,
    }
  }  
  let response = UrlFetchApp.fetch(url,options);
  let jsonResponse = JSON.parse(response.getContentText());
  let name = jsonResponse.name;
  let email = jsonResponse.email;
  let id = jsonResponse.id;
  let arryProyect =  jsonResponse.memberships;
  let activeWorkspace = jsonResponse.activeWorkspace;
  sheet.getRange(3 ,2 ,4 ,1).setValues([ [ name], [email], [id], [activeWorkspace] ]);
  getWorkspaces();
}

/*GET ALL PROYECT FROM A USER*/
function getWorkspaces (){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("DATOS");
  const token = sheetData.getRange('DATOS!$B$1').getValue();
  const workspaceId = sheet.getRange(6, 2).getValue();
  deleteOldData(sheet,9,sheet.getLastRow()-8);
  try {
    const url = 'https://api.clockify.me/api/v1/workspaces/'+workspaceId+'/projects'; 
    var options = {
    'method' : 'GET',
    'contentType': 'application/json',
    'headers': {
      'X-Api-Key' : token,
    }
  }  
  let response = UrlFetchApp.fetch(url,options);
  let jsonResponse = JSON.parse(response.getContentText());
  writeJson(jsonResponse)
  } catch (e) {
    spreadsheet.toast("Ocurrio un error en la llamada API ");
  }
}

/*WRITE A JSON ON DATA SHEET*/
function writeJson(json) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("DATOS");
  spreadsheet.toast("Inserting "+json.length+" rows" ,'Status', 3);
   for(var i =0; i<json.length;i++){
     let name = json[i].name;
     let id = json[i].id;
     var values = [ [ name, id ] ]; 
     var lastRow = sheet.getLastRow();
     sheet.getRange(lastRow+1 ,1 ,1 ,2).setValues(values);
   }
  spreadsheet.toast("All done", 'Status',3);
  var lastRow = sheet.getLastRow();
  let range = sheet.getRange(9 ,1 ,lastRow-8);
  spreadsheet.setNamedRange('proyects', range);
  var rangeCheck = spreadsheet.getRangeByName('proyects');
  var rangeCheckName = rangeCheck.getA1Notation();
  createDataValidation(rangeCheckName) //A9:A20
}

/*DELETE ALL PROYECT*/
function deleteOldData(sheet , firtRow, cantRow){
  if(cantRow > 0){
    sheet.deleteRows(firtRow, cantRow);
  }
}

/*CREATE DATA SELECT WITH PROYECT INFO*/
function createDataValidation(rangeCheckName){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetData = spreadsheet.getSheetByName("DATOS");
  const sheetCarga = spreadsheet.getSheetByName("CARGA");
  const rangeValidation = sheetCarga.getRange('CARGA!$D$5:$D$18').setDataValidation(SpreadsheetApp.newDataValidation().setAllowInvalid(false).requireValueInRange(spreadsheet.getRange(rangeCheckName), true).build());
}

/*SEND TASK TO CLOCKIFY API*/
function sendTask(){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetData = spreadsheet.getSheetByName("DATOS");
  const sheetCarga = spreadsheet.getSheetByName("CARGA");  
  const range = sheetCarga.getRange('CARGA!$A$5:$E$18'); 
  const values = range.getValues();
  const token = sheetData.getRange('DATOS!$B$1').getValue();
  let date = sheetCarga.getRange('CARGA!$B$1').getValue(); 
  date = Utilities.formatDate(date, "GMT","yyyy-MM-dd"); //2020-06-18
  const workSpaceId = sheetData.getRange('B6').getValue(); 
  const url = 'https://api.clockify.me/api/v1/workspaces/'+workSpaceId+'/time-entries';
  const UTC = sheetData.getRange('DATOS!$E$1').getValue();
  let sumHr = (UTC === 'ARGENTINA' ? 3 : 5 )
  for (var row in values) {
    let hrStart = values[row][0];
    let hrEnd = values[row][1];
    let idProyect = vlookup(sheetData, 1 , 1, values[row][3]);
    let Desc = values[row][4];
    if( hrStart !=='' && hrEnd !== '' &&  idProyect !== '' && Desc !== '' ){     
      var inicio = Utilities.formatDate(values[row][0], "GMT", "HH:mm:00.000'Z'");
      var fin = Utilities.formatDate(values[row][1], "GMT", "HH:mm:00.000'Z'");
      const data = {
        "start": date+"T"+inicio,
        "description": Desc,
        "projectId": idProyect,
        "end": date+"T"+fin,
        "tagIds": [        
        ]
      }
      try {
        var options = {
          'method' : 'POST',
          'contentType': 'application/json',
          'headers': {
            'X-Api-Key' : token,
          },
          'payload': JSON.stringify(data),
        }  
        let response = UrlFetchApp.fetch(url,options);
        let responseCode = response.getResponseCode();
        if (responseCode === 201) {
          let jsonResponse = JSON.parse(response.getContentText()); 
          spreadsheet.toast("La tarea fue generada ");
          colorRow(row, true, sheetCarga)
        }
      } catch (e) {
          colorRow(row, false, sheetCarga)
          spreadsheet.toast("Ocurrio un error en la llamada API ");
      }
    }else{
       spreadsheet.toast("La tarea NO fue generada revise los datos ingresados");
      colorRow(row, false, sheetCarga); 
    }      
  }
}

function colorRow(row , status, sheet){
  let realRow = parseInt(row) +5;
  let str = 'CARGA!$A$'+realRow+':$E$'+realRow;
  if(status){
    range = sheet.getRange(str).setBackground("green");
  }else{
    range = sheet.getRange(str).setBackground("red");
  }
}


function vlookup(sheet, column, index, value){
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(9,column,lastRow,column+index).getValues();
  for(i = 0; i < data.length ; ++i){
    if (data[i][0] == value){
      return data[i][index];
    }
  }
}
