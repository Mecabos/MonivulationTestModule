$(document).ready(function () {

    var userId;
    var firstEntryDate;
    var selectedWeightValues = [];

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
            $("#createWeightsData_div_id").show();
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createWeightsData_div_id").hide();
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
        $("#createWeightsData_div_id").show();

    }

    //************Initial data for new Cycle
    function updateNewWeightsEntryDate(lastCycleInfo) {
        if (lastCycleInfo.entryDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.entryDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 1));
            setAllWeightsData(1);
        } else if (lastCycleInfo.startDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.startDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 0));
            setAllWeightsData(1);
        } else {
            getCycleInfoAPI(userId, formatDateForServer(new Date().toDateInputValue()), updateNewWeightsEntryDate);
        }

    }

    //************New Cycles table config
    function getRowColumns(index) {
        var initialNewWeightsTableData = [
            [
                '<span class="rowIndex">' + index + '</span>',
                '<input type="date" class="entryDate_input_class form-control" id="entryDate_input_id_' + index + '">',
                '<div id="weightRange_slider_id_' + index + '" class="form-control">' +
                '<div id="weightRange_handle_id_' + index + '" class="ui-slider-handle"></div>' +
                '</div>'
            ]
        ];
        return initialNewWeightsTableData;
    }

    var newWeightsDataTable = $('#newWeightsData_table_id').DataTable({
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
                    newWeightsDataTable.clear();
                    newWeightsDataTable.rows.add(getRowColumns(1)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpWeightValueSlider(1);
                },
                className: 'action_btn_class'
            },
            {
                text: '+1',
                action: function (e, dt, node, config) {
                    var index = newWeightsDataTable.rows().count() + 1;
                    newWeightsDataTable.rows.add(getRowColumns(index)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpWeightValueSlider(index);
                },
                className: 'action_btn_class'
            },
            {
                text: '+5',
                action: function (e, dt, node, config) {
                    var originalCount = newWeightsDataTable.rows().count();
                    for (i = 1; i <= 5; i++) {
                        newWeightsDataTable.rows.add(getRowColumns(originalCount + i)).draw();
                        setUpWeightValueSlider(originalCount + i);
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
                    getLastWeightAPI(userId, updateNewWeightsEntryDate);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'setData_btn_id'
                },
            },
            {
                text: 'Run',
                action: function (e, dt, node, config) {
                    collectDataForWeightsCreation(1);
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
                    var entryDate = addNumberOfDays($("#entryDate_input_id_1").val(), 0);
                    formattedForServerEntryDate = formatDateForServer(entryDate);
                    startPregnancyAPI(userId,formattedForServerEntryDate,function () {
                        alert("New Pregnancy created at date " + formatDateFromServer(formattedForServerEntryDate));
                    })
                },
                className: 'action_btn_class',
                attr: {
                    id: 'startPregnancy_btn_id',
                    disabled: 'true'
                },
            }
        ],
        "initComplete": function (settings, json) {
            setUpWeightValueSlider(1);
        }
    });

    //************New Cycles Data calculation
    function setAllWeightsData(i) {
        if (i <= newWeightsDataTable.rows().count()) {
            if (i == 1) {
                $("#entryDate_input_id_1").val(firstEntryDate);
            } else {
                var lastRowEntryDate = $("#entryDate_input_id_" + (i - 1)).val();
                var currentRowEntryDate = addNumberOfDays(lastRowEntryDate, 1);
                $("#entryDate_input_id_" + i).val(formatDateForHtml(currentRowEntryDate));
            }
            i++;
            setAllWeightsData(i);
        } else {
            $("#run_btn_id").attr('disabled', false);
            $("#startNewCycle_btn_id").attr('disabled', false);
            $("#startPregnancy_btn_id").attr('disabled', false);
        }
    }

    //************Weight slider
    function setUpWeightValueSlider(index){
        var handle = $("#weightRange_handle_id_"+index);
        var selectedWeightValue;
        $("#weightRange_slider_id_"+index).slider({
            range: false,
            min: 40,
            max: 150,
            step: 0.5,
            create: function () {
                handle.text($(this).slider("value"));
            },
            slide: function (event, ui) {
                selectedWeightValues[index-1] = ui.value;
                handle.text(ui.value);
            }
        });
    }

    //************Weight data creation
    function collectDataForWeightsCreation(index) {
        if (index <= newWeightsDataTable.rows().count()) {
            var entryDate = addNumberOfDays($("#entryDate_input_id_" + index).val(), 0);
            formattedForServerEntryDate = formatDateForServer(entryDate);
            weightValue = selectedWeightValues[index-1];
            if (weightValue == 0 || weightValue == undefined)
                weightValue = 40;
            weightData = {
                value: weightValue,
                entryDate: formattedForServerEntryDate
            }
            createNewWeightData(weightData,index);
        } else {
            getLastWeightAPI(userId, updateNewWeightsEntryDate);
            console.log("-----FINISHED INSERTING " + (index - 1) + " Weights data-----");
        }
    }

    function createNewWeightData(weightData,i) {
        addSingleWeightDataAPI(userId, weightData, function () {
            getCycleInfoAPI(userId,weightData.entryDate , function (response) {
                console.log(formatDateFromServer(weightData.entryDate) + " : " + weightData.value + "Kg" + "||Current Day :" + response.currentDayOfCycle);
                collectDataForWeightsCreation(i+1);
            });
        })
    }
});

