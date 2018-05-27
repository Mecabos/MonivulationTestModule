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
            $("#createWeightData_div_id").show();
            getLastWeightAPI(userId, updateNewWeightDataEntryDate);
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createWeightData_div_id").hide();
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
        $("#createWeightData_div_id").show();
        getLastWeightAPI(userId, updateNewWeightDataEntryDate);
    }

    //************Initial data for new weight data
    function updateNewWeightDataEntryDate(lastWeightDataInfo) {
        if (lastWeightDataInfo.entryDate != undefined) {
            formattedLastWeightEntryDate = formatDateFromServer(lastWeightDataInfo.entryDate);
            $("#weightDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastWeightEntryDate, 1)));
        } else if (lastWeightDataInfo.startDate != undefined) {
            formattedLastWeightEntryDate = formatDateFromServer(lastWeightDataInfo.startDate);
            $("#weightDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastWeightEntryDate, 0)));
        } else {
            getCycleInfoAPI(userId,formatDateForServer(new Date().toDateInputValue()), updateNewWeightDataEntryDate);
        }

    }

    //************Weight slider
    var handle = $("#weightRange_handle_id");
    var selectedWeightValue;
    $("#weightRange_slider_id").slider({
        range: false,
        min: 40,
        max: 150,
        step: 0.1,
        create: function () {
            handle.text($(this).slider("value"));
        },
        slide: function (event, ui) {
            selectedWeightValue = ui.value;
            handle.text(ui.value);
        }
    });
    //************Weight data creation
    $("#createWeightData_form_id").submit(function (event) {
        event.preventDefault();
        entryDate = addNumberOfDays($("#weightDataEntryDate_input_id").val(), 0);
        formattedForServerEntryDate = formatDateForServer(entryDate);
        weightValue = selectedWeightValue;
        if (weightValue == 0 || weightValue == undefined)
            weightValue = 40;
        weightData = {
            value: weightValue,
            entryDate: formattedForServerEntryDate
        }
        createNewWeightData(weightData);
    });

    function createNewWeightData(weightData) {
        addSingleWeightDataAPI(userId, weightData, function () {
            getCycleInfoAPI(userId,weightData.entryDate , function (response) {
                console.log(formatDateFromServer(weightData.entryDate) + " : " + weightData.value + "Kg" + "||Current Day :" + response.currentDayOfCycle);
                getLastWeightAPI(userId, updateNewWeightDataEntryDate);
            });
        })
    }
});

