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
            $("#createTempData_div_id").show();
            getLastTemperatureAPI(userId, updateNewTempDataEntryDate);
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createTempData_div_id").hide();
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
        $("#createTempData_div_id").show();
        getLastTemperatureAPI(userId, updateNewTempDataEntryDate);
    }

    //************Initial data for new temp data
    function updateNewTempDataEntryDate(lastTempDataInfo) {
        if (lastTempDataInfo.entryDate != undefined) {
            formattedLastTempEntryDate = formatDateFromServer(lastTempDataInfo.entryDate);
            $("#tempDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastTempEntryDate, 1)));
        } else if (lastTempDataInfo.startDate != undefined) {
            formattedLastTempEntryDate = formatDateFromServer(lastTempDataInfo.startDate);
            $("#tempDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastTempEntryDate, 0)));
        } else {
            getCycleInfoAPI(userId,new Date().toDateInputValue(), updateNewTempDataEntryDate);
        }

    }

    //************Temperature slider
    var handle = $("#tempRange_handle_id");
    var selectedTempValue;
    $("#tempRange_slider_id").slider({
        range: false,
        min: 36,
        max: 38,
        step: 0.1,
        create: function () {
            handle.text($(this).slider("value"));
        },
        slide: function (event, ui) {
            selectedTempValue = ui.value;
            handle.text(ui.value);
        }
    });
    //************Temperature data creation
    $("#createTempData_form_id").submit(function (event) {
        event.preventDefault();
        entryDate = addNumberOfDays($("#tempDataEntryDate_input_id").val(), 0);
        formattedForServerEntryDate = formatDateForServer(entryDate);
        tempValue = selectedTempValue;
        tempData = {
            value: tempValue,
            entryDate: formattedForServerEntryDate
        }
        createNewTempData(tempData);
    });

    function createNewTempData(tempData) {
        addSingleTempDataAPI(userId, tempData, function () {
            getCycleInfoAPI(userId,tempData.entryDate , function (response) {
                console.log(formatDateFromServer(tempData.entryDate) + " : " + tempData.value + "°" + "=> Status :\"" + response.currentStatus + "\"||Current Day :" + response.currentDayOfCycle);
                getLastTemperatureAPI(userId, updateNewTempDataEntryDate);
            });
        })
    }
});

