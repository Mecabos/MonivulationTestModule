$(document).ready(function () {

    var userId;
    var firstStartDate;
    var cycleCount;

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
            $("#createCycles_div_id").show();
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createCycles_div_id").hide();
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
        $("#createCycles_div_id").show();

    }

    //************Initial data for new Cycle
    function updateNewCycleStartDate(lastCycleInfo) {
        if (lastCycleInfo.entryDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.entryDate);
            firstStartDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 1));
            setAllCyclesData(1);
        } else if (lastCycleInfo.endDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.endDate);
            firstStartDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 0));
            setAllCyclesData(1);
        } else {
            getCycleInfoAPI(userId, formatDateForServer(new Date().toDateInputValue()) ,updateNewCycleStartDate);
        }

    }

    //************New Cycles table config
    function getRowColumns(index) {
        var initialNewCyclesTableData = [
            [
                '<span class="rowIndex">' + index + '</span>',
                '<input type="date" class="startDate_input_class form-control" id="startDate_input_id_' + index + '">',
                '<input type="date" class="ovulationDate_input_class form-control" id="ovulationDate_input_id_' + index + '" disabled>',
                '<input type="number" class="cycleLength_input_class form-control" value="28" id="cycleLength_input_id_' + index + '">',
                '<input type="number" class="periodLength_input_class form-control" value="5" id="periodLength_input_id_' + index + '">',
                '<span class="calculation_title">follicular length : <span id="follicularLengthCalculation_span_id_' + index + '" class="calculation_value">14</span> </span> ---' +
                '<span class="calculation_title">luteal length : <span id="lutealLengthCalculation_span_id_' + index + '" class="calculation_value">13</span> </span>'
            ]
        ];
        return initialNewCyclesTableData;
    }

    var newCyclesTable = $('#newCycles_table_id').DataTable({
        "dom": 'Bfrtip',
        "data": getRowColumns(1),
        "paging": false,
        "ordering": false,
        "info": false,
        "searching": false,
        "buttons": [
            {
                text: 'Reset',
                action: function (e, dt, node, config) {
                    newCyclesTable.clear();
                    newCyclesTable.rows.add(getRowColumns(1)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#cycleLength_input_id_1").on("change", {index: 1}, onCycleLengthChange);
                },
                className: 'action_btn_class'
            },
            {
                text: '+1',
                action: function (e, dt, node, config) {
                    var index = newCyclesTable.rows().count() + 1;
                    newCyclesTable.rows.add(getRowColumns(index)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#cycleLength_input_id_" + index).on("change", {index: index}, onCycleLengthChange);
                },
                className: 'action_btn_class'
            },
            {
                text: '+5',
                action: function (e, dt, node, config) {
                    var originalCount = newCyclesTable.rows().count();
                    for (i = 1; i <= 5; i++) {
                        newCyclesTable.rows.add(getRowColumns(originalCount + i)).draw();
                        $("#cycleLength_input_id_" + i).on("change", {index: i}, onCycleLengthChange);
                    }
                    $("#run_btn_id").attr('disabled', true);
                },
                className: 'action_btn_class'
            },
            {
                text: 'Set Data',
                action: function (e, dt, node, config) {
                    getLastTemperatureAPI(userId, updateNewCycleStartDate);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'setData_btn_id'
                },
            },
            {
                text: 'Run',
                action: function (e, dt, node, config) {
                    cycleCount = 1;
                    collectDataForCycleCreation(cycleCount);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'run_btn_id',
                    disabled: 'true'
                },
            },
        ],
        "initComplete": function (settings, json) {
            $("#cycleLength_input_id_1").on("change", {index: 1}, onCycleLengthChange);
        }
    });

    //************New Cycles Data calculation
    function setAllCyclesData(i) {
        if (i <= newCyclesTable.rows().count()) {
            if (i == 1) {
                $("#startDate_input_id_1").val(firstStartDate);
                updateOvulationDate(1, firstStartDate);
            } else {
                var lastRowStartDate = $("#startDate_input_id_" + (i - 1)).val();
                var lastRowCycleLength = $("#cycleLength_input_id_" + (i - 1)).val();
                var currentRowStartDate = addNumberOfDays(lastRowStartDate, parseInt(lastRowCycleLength));
                $("#startDate_input_id_" + i).val(formatDateForHtml(currentRowStartDate));
                updateOvulationDate(i, currentRowStartDate);
            }
            i++;
            setAllCyclesData(i);
        } else {
            $("#run_btn_id").attr('disabled', false);
        }
    }

    function updateOvulationDate(index, currentRowStartDate) {
        var cycleLength = $("#cycleLength_input_id_" + index).val();
        if (currentRowStartDate != "" && cycleLength != "") {
            var lutealLength = 13;
            var follicularLength = cycleLength - 13;

            $("#follicularLengthCalculation_span_id_" + index).html(follicularLength);
            $("#lutealLengthCalculation_span_id" + index).html(lutealLength);

            $("#ovulationDate_input_id_" + index).val(formatDateForHtml(addNumberOfDays(currentRowStartDate, follicularLength)));
        }
    }

    function onCycleLengthChange(event) {
        $("#run_btn_id").attr('disabled', true);
        var index = event.data.index;
        var currentRowStartDate = $("#startDate_input_id_" + index).val();
        updateOvulationDate(index, currentRowStartDate);
    }

    //************New cycles creation
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
            cycleCount++;
            collectDataForCycleCreation(cycleCount);
        }
    }

    function collectDataForCycleCreation(index) {
        if (index <= newCyclesTable.rows().count()) {
            startDate = addNumberOfDays($("#startDate_input_id_" + index).val(), 0);
            ovulationDate = addNumberOfDays($("#ovulationDate_input_id_" + index).val(), 0);
            cycleLength = $("#cycleLength_input_id_" + index).val();
            //periodLength = $("#periodLength_input_id_"+index).val();
            newCycleParams = {
                startDate: startDate,
                ovulationDate: ovulationDate,
                cycleLength: cycleLength
            }
            console.log("******Started new cycle at date : " + formatDateForServer(newCycleParams.startDate) + " for user " + userId);
            startNewCycleAPI(userId, formatDateForServer(newCycleParams.startDate), createNewCycle, newCycleParams);
        }else{
            getLastTemperatureAPI(userId, updateNewCycleStartDate);
            console.log("-----FINISHED CREATING " + (index-1) + " CYCLES-----");
        }
    }
});

