$(document).ready(function () {

    var userId;
    var anomalyTableData = [];

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
            $("#anomalies_div_id").show();
            getAllAnomalyAPI(userId, populateAnomalyTable);
        }
        else {
            alert("Initial cycle and status not created please insert proper data");
            $("#createFirstCycle_div_id").show();
            $("#anomalies_div_id").hide();
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
        getAllAnomalyAPI(userId, populateAnomalyTable);
    }

    //************Initial data for new Cycle
    function populateAnomalyTable (anomalyList){
        var i = 0;
        anomalyList.forEach(function(anomaly){
            i++;
            if (anomaly.anomalyDegree == "Problematic"){
                anomalyTableData.push(
                    [
                        '<span class="rowIndex">' + i + '</span>',
                        '<span class="anomalyName_span_class" style="color: violet;">' + anomaly.name + '</span>',
                        '<span class="anomalyDate_span_class">' + formatDateFromServer(anomaly.startDate) + '</span>',
                        '<span class="anomalyDegree_span_class" style="color: orange;">' + anomaly.anomalyDegree + '</span>',
                        '<span class="anomalyDescription_span_class">' + anomaly.description + '</span>',
                        '<span class="anomalyAdvice_span_class">' + anomaly.advice + '</span>',
                    ]
                )
            }else{
                anomalyTableData.push(
                    [
                        '<span class="rowIndex">' + i + '</span>',
                        '<span class="anomalyName_span_class" style="color: violet;">' + anomaly.name + '</span>',
                        '<span class="anomalyDate_span_class">' + formatDateFromServer(anomaly.startDate) + '</span>',
                        '<span class="anomalyDegree_span_class" style="color: red;">' + anomaly.anomalyDegree + '</span>',
                        '<span class="anomalyDescription_span_class">' + anomaly.description + '</span>',
                        '<span class="anomalyAdvice_span_class">' + anomaly.advice + '</span>',
                    ]
                )
            }

        })

        var anomalyTable = $('#anomaly_table_id').DataTable({
            "dom": 'Bfrtip',
            "data": anomalyTableData,
            "paging": true,
            "ordering": true,
            "info": true,
            "searching": true
        });
    }




});

