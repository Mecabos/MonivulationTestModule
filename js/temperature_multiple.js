$(document).ready(function () {

    var userId;
    var firstEntryDate;
    var selectedTempValues = [];

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
            $("#createTempsData_div_id").show();
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createTempsData_div_id").hide();
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
        $("#createTempsData_div_id").show();

    }

    //************Initial data for new Cycle
    function updateNewTempsEntryDate(lastCycleInfo) {
        if (lastCycleInfo.entryDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.entryDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 1));
            setAllTempsData(1);
        } else if (lastCycleInfo.startDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.startDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 0));
            setAllTempsData(1);
        } else {
            getCycleInfoAPI(userId, formatDateForServer(new Date().toDateInputValue()), updateNewTempsEntryDate);
        }

    }

    //************New Cycles table config
    function getRowColumns(index) {
        var initialNewTempsTableData = [
            [
                '<span class="rowIndex">' + index + '</span>',
                '<input type="date" class="entryDate_input_class form-control" id="entryDate_input_id_' + index + '">',
                '<div id="tempRange_slider_id_' + index + '" class="form-control">' +
                '<div id="tempRange_handle_id_' + index + '" class="ui-slider-handle"></div>' +
                '</div>'
            ]
        ];
        return initialNewTempsTableData;
    }

    var newTempsDataTable = $('#newTempsData_table_id').DataTable({
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
                    newTempsDataTable.clear();
                    newTempsDataTable.rows.add(getRowColumns(1)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpTempValueSlider(1);
                },
                className: 'action_btn_class'
            },
            {
                text: '+1',
                action: function (e, dt, node, config) {
                    var index = newTempsDataTable.rows().count() + 1;
                    newTempsDataTable.rows.add(getRowColumns(index)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpTempValueSlider(index);
                },
                className: 'action_btn_class'
            },
            {
                text: '+5',
                action: function (e, dt, node, config) {
                    var originalCount = newTempsDataTable.rows().count();
                    for (i = 1; i <= 5; i++) {
                        newTempsDataTable.rows.add(getRowColumns(originalCount + i)).draw();
                        setUpTempValueSlider(originalCount + i);
                    }
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                },
                className: 'action_btn_class'
            },
            {
                text: 'Set Data',
                action: function (e, dt, node, config) {
                    getLastTemperatureAPI(userId, updateNewTempsEntryDate);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'setData_btn_id'
                },
            },
            {
                text: 'Run',
                action: function (e, dt, node, config) {
                    collectDataForTempsCreation(1);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'run_btn_id',
                    disabled: 'true'
                },
            },
            {
                text: 'Start new cycle',
                action: function (e, dt, node, config) {
                    var entryDate = addNumberOfDays($("#entryDate_input_id_1").val(), 0);
                    formattedForServerEntryDate = formatDateForServer(entryDate);
                    startNewCycleOnlyAPI(userId,formattedForServerEntryDate,function () {
                        alert("New cycle created at date " + formatDateFromServer(formattedForServerEntryDate));
                    })
                },
                className: 'action_btn_class',
                attr: {
                    id: 'startNewCycle_btn_id',
                    disabled: 'true',
                    css: 'color : red'
                },
            },
            {
                text: 'Start pregnancy',
                action: function (e, dt, node, config) {
                    collectDataForTempsCreation(1);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'startPregnancy_btn_id',
                    disabled: 'true'
                },
            }
        ],
        "initComplete": function (settings, json) {
            setUpTempValueSlider(1);
        }
    });

    //************New Cycles Data calculation
    function setAllTempsData(i) {
        if (i <= newTempsDataTable.rows().count()) {
            if (i == 1) {
                $("#entryDate_input_id_1").val(firstEntryDate);
            } else {
                var lastRowEntryDate = $("#entryDate_input_id_" + (i - 1)).val();
                var currentRowEntryDate = addNumberOfDays(lastRowEntryDate, 1);
                $("#entryDate_input_id_" + i).val(formatDateForHtml(currentRowEntryDate));
            }
            i++;
            setAllTempsData(i);
        } else {
            $("#run_btn_id").attr('disabled', false);
            $("#startNewCycle_btn_id").attr('disabled', false);
            $("#startPregnancy_btn_id").attr('disabled', false);
        }
    }

    //************Temperature slider
    function setUpTempValueSlider(index){
        var handle = $("#tempRange_handle_id_"+index);
        var selectedTempValue;
        $("#tempRange_slider_id_"+index).slider({
            range: false,
            min: 36,
            max: 38,
            step: 0.1,
            create: function () {
                handle.text($(this).slider("value"));
            },
            slide: function (event, ui) {
                selectedTempValues[index-1] = ui.value;
                handle.text(ui.value);
            }
        });
    }

    //************Temperature data creation
    function collectDataForTempsCreation(index) {
        if (index <= newTempsDataTable.rows().count()) {
            var entryDate = addNumberOfDays($("#entryDate_input_id_" + index).val(), 0);
            formattedForServerEntryDate = formatDateForServer(entryDate);
            tempValue = selectedTempValues[index-1];
            tempData = {
                value: tempValue,
                entryDate: formattedForServerEntryDate
            }
            createNewTempData(tempData,index);
        } else {
            getLastTemperatureAPI(userId, updateNewTempsEntryDate);
            console.log("-----FINISHED INSERTING " + (index - 1) + " Temperatures data-----");
        }
    }

    function createNewTempData(tempData,i) {
        addSingleTempDataAPI(userId, tempData, function () {
            getCycleInfoAPI(userId,tempData.entryDate , function (response) {
                console.log(formatDateFromServer(tempData.entryDate) + " : " + tempData.value + "°" + "=> Status :\"" + response.currentStatus + "\"||Current Day :" + response.currentDayOfCycle);
                collectDataForTempsCreation(i+1);
            });
        })
    }
});

