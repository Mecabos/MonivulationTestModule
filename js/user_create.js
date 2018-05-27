$(document).ready(function () {
    currentDate = currentDate();

    $('#inscriptionDate_input_id').val(formatDateForHtml(currentDate));


    $("#demo-form2").submit(function (event) {
        event.preventDefault();
        formattedBirthDate = formatDateForServer($('#birthDate_input_id').val());
        formattedInscriptionDate = formatDateForServer($('#inscriptionDate_input_id').val());
        userData = {
            email: $('#email_input_id').val(),
            username: $('#username_input_id').val(),
            password: $('#password_input_id').val(),
            firstName: $('#firstName_input_id').val(),
            lastName: $('#lastName_input_id').val(),
            birthDate: formattedBirthDate,
            inscriptionDate: formattedInscriptionDate,
        }
        createUserAPI(userData, createUserCallback);
    });

    function createUserCallback(response) {
        if (response.id != undefined)
            alert("User created with ID : " + response.id);
        else
            alert("User already exist");
    }

    var params = {
        temp: 64,
        lumiere: 5
    }
    url = addUrlParams(url, params)




});

