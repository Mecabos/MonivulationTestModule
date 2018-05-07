
/*---------------------------------Date Methods---------------------------------*/
Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function currentDate() {
    return new Date().toDateInputValue()
}

function addNumberOfDays(dateToAddTo,numberOfDaysToAdd){
    var dat = new Date(dateToAddTo);
    return dat.addDays(numberOfDaysToAdd)
}

function getDurationBetween(date1,date2){
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    var timeDiff = Math.abs(d2.getTime() - d1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}


function formatDateForServer(dateToFormat) {
    date = new Date(dateToFormat);
    month = '' + (date.getMonth() + 1);
    day = '' + date.getDate();
    year = date.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return day + "-" + month + "-" + year + " 00:00:00";
}


function formatDateForHtml(dateToFormat) {
    date = new Date(dateToFormat);
    month = "" + (date.getMonth() + 1);
    day = '' + date.getDate();
    year = date.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return  year + "-" + month + "-" + day   ;
}

function formatDateFromServer(dateToFormat) {
    tempDay = parseInt(dateToFormat.substring(0,2));
    tempMonth = parseInt(dateToFormat.substring(3,5));
    tempYear = parseInt(dateToFormat.substring(6,10));
    date = new Date(tempYear,tempMonth-1,tempDay);
    month = '' + (date.getMonth() +1);
    day = '' + date.getDate();
    year = date.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return  year + "-" + month + "-" + day   ;
}

/*---------------------------------Calculations Methods---------------------------------*/
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function pickTempValue(isInFolicular){
    var folicularTempList = [36.2,36.3,36.4,36.5,36.6,36.7,36.8,36.9];
    var lutealTempList = [37.0,37.1,37.2,37.3,37.4,37.5,37.6,37.7];
    var pickedTempValue = 0.0;
    if(isInFolicular){
        pickedTempValue = folicularTempList[randomIntFromInterval(0,folicularTempList.length-1)];
    }else{
        pickedTempValue = lutealTempList[randomIntFromInterval(0,lutealTempList.length-1)];
    }
    return pickedTempValue;
}

