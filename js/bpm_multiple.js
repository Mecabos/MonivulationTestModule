$(document).ready(function () {

    var userId;
    var firstEntryDate;
    var selectedBpmValues = [];

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
            $("#createBpmsData_div_id").show();
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#createBpmsData_div_id").hide();
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
        $("#createBpmsData_div_id").show();

    }

    //************Initial data for new Cycle
    function updateNewBpmsEntryDate(lastCycleInfo) {
        if (lastCycleInfo.entryDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.entryDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 1));
            setAllBpmsData(1);
        } else if (lastCycleInfo.startDate != undefined) {
            formattedLastCycleEndDate = formatDateFromServer(lastCycleInfo.startDate);
            firstEntryDate = formatDateForHtml(addNumberOfDays(formattedLastCycleEndDate, 0));
            setAllBpmsData(1);
        } else {
            getCycleInfoAPI(userId, formatDateForServer(new Date().toDateInputValue()), updateNewBpmsEntryDate);
        }

    }

    //************New Cycles table config
    function getRowColumns(index) {
        var initialNewBpmsTableData = [
            [
                '<span class="rowIndex">' + index + '</span>',
                '<input type="date" class="entryDate_input_class form-control" id="entryDate_input_id_' + index + '">',
                '<div id="bpmRange_slider_id_' + index + '" class="form-control">' +
                '<div id="bpmRange_handle_id_' + index + '" class="ui-slider-handle"></div>' +
                '</div>'
            ]
        ];
        return initialNewBpmsTableData;
    }

    var newBpmsDataTable = $('#newBpmsData_table_id').DataTable({
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
                    newBpmsDataTable.clear();
                    newBpmsDataTable.rows.add(getRowColumns(1)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpBpmValueSlider(1);
                },
                className: 'action_btn_class'
            },
            {
                text: '+1',
                action: function (e, dt, node, config) {
                    var index = newBpmsDataTable.rows().count() + 1;
                    newBpmsDataTable.rows.add(getRowColumns(index)).draw();
                    $("#run_btn_id").attr('disabled', true);
                    $("#startNewCycle_btn_id").attr('disabled', true);
                    $("#startPregnancy_btn_id").attr('disabled', true);
                    setUpBpmValueSlider(index);
                },
                className: 'action_btn_class'
            },
            {
                text: '+5',
                action: function (e, dt, node, config) {
                    var originalCount = newBpmsDataTable.rows().count();
                    for (i = 1; i <= 5; i++) {
                        newBpmsDataTable.rows.add(getRowColumns(originalCount + i)).draw();
                        setUpBpmValueSlider(originalCount + i);
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
                    getLastBpmAPI(userId, updateNewBpmsEntryDate);
                },
                className: 'action_btn_class',
                attr: {
                    id: 'setData_btn_id'
                },
            },
            {
                text: 'Run',
                action: function (e, dt, node, config) {
                    collectDataForBpmsCreation(1);
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
            setUpBpmValueSlider(1);
        }
    });

    //************New Cycles Data calculation
    function setAllBpmsData(i) {
        if (i <= newBpmsDataTable.rows().count()) {
            if (i == 1) {
                $("#entryDate_input_id_1").val(firstEntryDate);
            } else {
                var lastRowEntryDate = $("#entryDate_input_id_" + (i - 1)).val();
                var currentRowEntryDate = addNumberOfDays(lastRowEntryDate, 1);
                $("#entryDate_input_id_" + i).val(formatDateForHtml(currentRowEntryDate));
            }
            i++;
            setAllBpmsData(i);
        } else {
            $("#run_btn_id").attr('disabled', false);
            $("#startNewCycle_btn_id").attr('disabled', false);
            $("#startPregnancy_btn_id").attr('disabled', false);
        }
    }

    //************Bpm slider
    function setUpBpmValueSlider(index){
        var handle = $("#bpmRange_handle_id_"+index);
        var selectedBpmValue;
        $("#bpmRange_slider_id_"+index).slider({
            range: false,
            min: 60,
            max: 100,
            step: 0.5,
            create: function () {
                handle.text($(this).slider("value"));
            },
            slide: function (event, ui) {
                selectedBpmValues[index-1] = ui.value;
                handle.text(ui.value);
            }
        });
    }

    //************Bpm data creation
    function collectDataForBpmsCreation(index) {
        if (index <= newBpmsDataTable.rows().count()) {
            var entryDate = addNumberOfDays($("#entryDate_input_id_" + index).val(), 0);
            formattedForServerEntryDate = formatDateForServer(entryDate);
            bpmValue = selectedBpmValues[index-1];
            if (bpmValue == 0 || bpmValue == undefined)
                bpmValue = 60;
            bpmData = {
                value: bpmValue,
                entryDate: formattedForServerEntryDate
            }
            createNewBpmData(bpmData,index);
        } else {
            getLastBpmAPI(userId, updateNewBpmsEntryDate);
            console.log("-----FINISHED INSERTING " + (index - 1) + " Bpms data-----");
        }
    }

    function createNewBpmData(bpmData,i) {
        addSingleBpmDataAPI(userId, bpmData, function () {
            getCycleInfoAPI(userId,bpmData.entryDate , function (response) {
                console.log(formatDateFromServer(bpmData.entryDate) + " : " + bpmData.value + "bpm" + "||Current Day :" + response.currentDayOfCycle);
                collectDataForBpmsCreation(i+1);
            });
        })
    }
});

