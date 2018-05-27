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
            $("#createBpmData_div_id").show();
            getLastBpmAPI(userId, updateNewBpmDataEntryDate);
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createBpmData_div_id").hide();
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
        $("#createBpmData_div_id").show();
        getLastBpmAPI(userId, updateNewBpmDataEntryDate);
    }

    //************Initial data for new bpm data
    function updateNewBpmDataEntryDate(lastBpmDataInfo) {
        if (lastBpmDataInfo.entryDate != undefined) {
            formattedLastBpmEntryDate = formatDateFromServer(lastBpmDataInfo.entryDate);
            $("#bpmDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastBpmEntryDate, 1)));
        } else if (lastBpmDataInfo.startDate != undefined) {
            formattedLastBpmEntryDate = formatDateFromServer(lastBpmDataInfo.startDate);
            $("#bpmDataEntryDate_input_id").val(formatDateForHtml(addNumberOfDays(formattedLastBpmEntryDate, 0)));
        } else {
            getCycleInfoAPI(userId,formatDateForServer(new Date().toDateInputValue()), updateNewBpmDataEntryDate);
        }

    }

    //************Bpm slider
    var handle = $("#bpmRange_handle_id");
    var selectedBpmValue;
    $("#bpmRange_slider_id").slider({
        range: false,
        min: 60,
        max: 100,
        step: 0.1,
        create: function () {
            handle.text($(this).slider("value"));
        },
        slide: function (event, ui) {
            selectedBpmValue = ui.value;
            handle.text(ui.value);
        }
    });
    //************Bpm data creation
    $("#createBpmData_form_id").submit(function (event) {
        event.preventDefault();
        entryDate = addNumberOfDays($("#bpmDataEntryDate_input_id").val(), 0);
        formattedForServerEntryDate = formatDateForServer(entryDate);
        bpmValue = selectedBpmValue;
        if (bpmValue == 0 || bpmValue == undefined)
            bpmValue = 60;
        bpmData = {
            value: bpmValue,
            entryDate: formattedForServerEntryDate
        }
        createNewBpmData(bpmData);
    });

    function createNewBpmData(bpmData) {
        addSingleBpmDataAPI(userId, bpmData, function () {
            getCycleInfoAPI(userId,bpmData.entryDate , function (response) {
                console.log(formatDateFromServer(bpmData.entryDate) + " : " + bpmData.value + "bpm" + "||Current Day :" + response.currentDayOfCycle);
                getLastBpmAPI(userId, updateNewBpmDataEntryDate);
            });
        })
    }
});

