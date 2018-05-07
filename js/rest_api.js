/*---------------------------------URLS---------------------------------*/
var serverURL = 'http://localhost:8090';
var createUserURL = serverURL + '/users';
var getAllUserURL = serverURL + '/users';
var checkFirstCycleURL = serverURL + '/cycle/checkFirst/';
var createFirstCycleAndStatusURL = serverURL + '/cycle/first/';
var getCycleInfoURL = serverURL + '/cycle/info/';
var startPeriodURL = serverURL + '/cycle/startPeriod/';
var startPregnancyURL = serverURL + '/cycle/startPregnancy/';
var addTemperatureURL = serverURL + '/temperatureData/add/';
var getLastTemperatureURL = serverURL + '/temperatureData/getLast/';
/*---------------------------------REST Services---------------------------------*/
/*---USER---*/
function getAllUserAPI(callback){
    $.ajax({
        type: 'GET',
        url: getAllUserURL,
        contentType: "application/json",
        datatype: "application/json",
        data : {},
        success: function (response) {
            callback(response)
        }
    });
}

function createUserAPI(userData,callback){
    $.ajax({
        type: 'POST',
        url: createUserURL,
        contentType: "application/json",
        datatype: "application/json",
        data: JSON.stringify(userData),
        success: function (response) {
            callback(response);
        }
    });
}

/*---CYCLE---*/
function checkFirstCycleAPI(id,callback){
    $.ajax({
        type: 'GET',
        url: checkFirstCycleURL + id,
        contentType: "plain/text",
        datatype: "application/json",
        data : {},
        success: function (response) {
            callback(response)
        }
    });
}

function createFirstCycleAPI(userId,firstCycleData,callback){
    $.ajax({
        type: 'POST',
        url: createFirstCycleAndStatusURL + userId,
        data: JSON.stringify(firstCycleData),
        datatype: "application/json",
        contentType: "application/json",
        success: function (response) {
            callback(response);
        }
    });
}

function getCycleInfoAPI(id,entryDate,callback){
    cycleInfoParams = {
        entryDate : entryDate
    };
    $.ajax({
        type: 'POST',
        url: getCycleInfoURL + id,
        data : JSON.stringify(cycleInfoParams),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback(response);
        }
    });
}

function startNewCycleAPI(id,startDate,callback,newCycleParams){
    newCycleData = {
        startDate : startDate
    };
    $.ajax({
        type: 'POST',
        url: startPeriodURL + id,
        data :JSON.stringify(newCycleData),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback(newCycleParams,0);
        }
    });
}

function startNewCycleOnlyAPI(id,startDate,callback){
    newCycleData = {
        startDate : startDate
    };
    $.ajax({
        type: 'POST',
        url: startPeriodURL + id,
        data :JSON.stringify(newCycleData),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback();
        }
    });
}
/*---TEMPERATURE---*/
function addTempDataAPI(id,tempData, newCycleData, i, callback){
    $.ajax({
        type: 'POST',
        url: addTemperatureURL + id,
        data : JSON.stringify(tempData),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback(newCycleData,i);
        }
    });
}

function addSingleTempDataAPI(id,tempData,callback){
    $.ajax({
        type: 'POST',
        url: addTemperatureURL + id,
        data : JSON.stringify(tempData),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback(response);
        }
    });
}

function getLastTemperatureAPI(id,callback){
    $.ajax({
        type: 'GET',
        url: getLastTemperatureURL + id,
        data : {},
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback(response);
        }
    });
}
/*---PREGNANCY---*/
function startPregnancyAPI(id,startDate,callback){
    newCycleData = {
        startDate : startDate
    };
    $.ajax({
        type: 'POST',
        url: startPregnancyURL + id,
        data :JSON.stringify(newCycleData),
        contentType: "application/json",
        datatype: "application/json",
        success: function (response) {
            callback();
        }
    });
}
