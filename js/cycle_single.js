$(document).ready(function () {

    var userId;

    //************Users Loading
    getAllUserAPI(populateUserSelect);

    function populateUserSelect(users) {
        $.each(users, function (index, value) {
            $('#user_select_id').append($('<option/>', {
                value: value.id,
                text: value.username
            }));
        });
        $('#user_select_id').change(function () {
            userId = $(this).val();
            checkFirstCycleAPI(userId, checkFirstCycleCallback)
        });
    }

    //************Testing if first Cycle exists
    function checkFirstCycleCallback(firstCycleIsCreated) {
        if (firstCycleIsCreated) {
            $("#createFirstCycle_div_id").hide();
            $("#createCycle_div_id").show();
            getLastTemperatureAPI(userId, updateNewCycleStartDate);
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createCycle_div_id").hide();
        }
    }

    //************Creating first Cycle
    $("#createFirstCycle_form_id").submit(function (event) {
        event.preventDefault();
        formattedStartDate = formatDateForServer($('#startDate_input_id').val())
        formattedEntryDate = null;
        if ($('#entryDate_input_id').val() != "")
            formattedEntryDate = formatDateForServer($('#entryDate_input_id').val())
        firstCycleData = {
            startDate: formattedStartDate,
            length: $('#cycleLength_input_id').val(),
            periodLength: $('#periodLength_input_id').val(),
            entryDate: formattedEntryDate
        };

        createFirstCycleAPI(userId, firstCycleData, createFirstCycleCallback);

    });

    function createFirstCycleCallback(response) {
        alert(response)
        $("#createFirstCycle_div_id").hide();
        $("#createCycle_div_id").show();
        getLastTemperatureAPI(userId, updateNewCycleStartDate);
    }

    //************Initial data for new Cycle
    function updateNewCycleStartDate(lastCycleInfo) {
        if (lastCycleInfo.entryDate != undefined){
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.entryDate);
            $("#newStartDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 1)));
            updateNewOvulationDate();
        }else if (lastCycleInfo.endDate != undefined){
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.endDate);
            $("#newStartDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 0)));
            updateNewOvulationDate();
        }else {
            getCycleInfoAPI(userId, new Date().toDateInputValue() ,updateNewCycleStartDate);
        }

    }

    //************Calculation update for new Cycle
    function updateNewOvulationDate() {
        startDate = $("#newStartDate_input_id").val();
        cycleLength = $("#newCycleLength_input_id").val();
        if (startDate != "" && cycleLength != "") {
            lutealLength = 13;
            follicularLength = cycleLength - 13;

            $("#follicularLengthCalculation_span_id").html(follicularLength);
            $("#lutealLengthCalculation_span_id").html(lutealLength);

            $('#newOvulationDate_input_id').val(formatDateForHtml(addNumberOfDays(startDate, follicularLength)));
        }
    }

    $('#newStartDate_input_id, #newOvulationDate_input_id').change(function () {
        startDate = $("#newStartDate_input_id").val();
        ovulationDate = $("#newOvulationDate_input_id").val();
        cycleLength = $("#newCycleLength_input_id").val();

        if (startDate != "" && ovulationDate != "" && cycleLength != "") {
            follicularLength = getDurationBetween(startDate, ovulationDate);
            lutealLength = cycleLength - follicularLength;
            $("#follicularLengthCalculation_span_id").html(follicularLength);
            $("#lutealLengthCalculation_span_id").html(lutealLength);
        }
    });

    $('#newCycleLength_input_id').change(function () {
        updateNewOvulationDate();
    });

    //************New cycle creation
    function createNewCycle(newCycleParams, i) {
        endDate = addNumberOfDays(newCycleParams.startDate, newCycleParams.cycleLength);
        currentDate = addNumberOfDays(newCycleParams.startDate, i);
        formattedForServerCurrentDate = formatDateForServer(currentDate);
        pickedTemp = 0.0;
        if (i < newCycleParams.cycleLength) {
            if (currentDate < newCycleParams.ovulationDate)
                pickedTemp = pickTempValue(true);
            else
                pickedTemp = pickTempValue(false);

            tempData = {
                value: pickedTemp,
                entryDate: formattedForServerCurrentDate
            }
            i++;
            console.log(i + "))" + formattedForServerCurrentDate + " : " + pickedTemp + "°");
            addTempDataAPI(userId, tempData, newCycleParams, i, createNewCycle);
        } else {
            getLastTemperatureAPI(userId, updateNewCycleStartDate);
        }
    }

    $("#createCycle_form_id").submit(function (event) {
        event.preventDefault();
        startDate = addNumberOfDays($("#newStartDate_input_id").val(), 0);
        ovulationDate = addNumberOfDays($("#newOvulationDate_input_id").val(), 0);
        cycleLength = $("#newCycleLength_input_id").val();
        //periodLength = $("#newPeriodLength_input_id").val();
        newCycleParams = {
            startDate: startDate,
            ovulationDate: ovulationDate,
            cycleLength: cycleLength
        }
        console.log("******Started new cycle at date : " + formatDateForServer(newCycleParams.startDate) + " for user " + userId);
        startNewCycleAPI(userId, formatDateForServer(newCycleParams.startDate), createNewCycle, newCycleParams);
    });


});

