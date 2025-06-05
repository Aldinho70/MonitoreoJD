$(function () {

    //-----------------------------------------------------------------------------------------
    // Habilitar el arrastre
    $(".draggable").attr("draggable", "true");

    var dragged;
    var selectedRows = [];

    // Seleccionar filas al hacer clic
    $('tbody').on('click', 'tr', function() {
        $(this).toggleClass('selected');
    });

    // Eventos de arrastre
    $(document).on('dragstart', '.draggable', function(e) {
        dragged = $(this);
        selectedRows = $('.selected');
        if (!$(this).hasClass('selected')) {
            selectedRows.removeClass('selected');
            selectedRows = $(this);
        }
        e.originalEvent.dataTransfer.setData('text', ''); // Necesario para Firefox
        selectedRows.addClass('dragging');
    });

    $(document).on('dragend', '.draggable', function() {
        selectedRows.removeClass('dragging');
    });

    // Permitir soltado en las tablas
    $('table').on('dragover', function(e) {
        e.preventDefault();
    });

    $('table').on('drop', function(e) {
        e.preventDefault();
        var targetTableBody = $(this).find('tbody');
        selectedRows.each(function() {
            targetTableBody.append($(this));
        });
        selectedRows.removeClass('selected');
    });
    //---------------------------------------------------------------------------------------- 
    
    $('.btn-remove-alert-notificacion').click( function() {
        $("#cont-notifiaciones").text(parseInt($("#cont-notifiaciones").text()) - 1);
    });

    var divFlotante = document.getElementById('divFlotante');

    // Variables para guardar la posición inicial del div y la posición del cursor
    var posX, posY, mouseX, mouseY;

    // Función para comenzar a arrastrar el div
    function iniciarArrastre(e) {
        e.preventDefault();
        posX = divFlotante.offsetLeft;
        posY = divFlotante.offsetTop;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mousemove', arrastrar);
        document.addEventListener('mouseup', detenerArrastre);
    }

    // Función para arrastrar el div mientras se mueve el mouse
    function arrastrar(e) {
        var dx = e.clientX - mouseX;
        var dy = e.clientY - mouseY;
        divFlotante.style.left = (posX + dx) + 'px';
        divFlotante.style.top = (posY + dy) + 'px';
    }

    // Función para detener el arrastre
    function detenerArrastre() {
        document.removeEventListener('mousemove', arrastrar);
        document.removeEventListener('mouseup', detenerArrastre);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


    $(".fixed-left").resizable({
        handles: "e", // Solo el borde derecho es redimensionable
        minWidth: 300, // Ancho mínimo
        maxWidth: 400, // Ancho máximo
        resize: function (event, ui) {
            var newWidth = ui.size.width;
            $(".content").css("margin-left", newWidth + 20 + "px"); // 20px de padding
        }
    });

    function adjustOverlays() {
        var mapWidth = $("#map").width();
        var mapHeight = $("#map").height();
        $(".overlay").each(function () {
            var overlayWidth = $(this).width();
            var overlayHeight = $(this).height();
            var top = (mapHeight - overlayHeight) / 2;
            var left = (mapWidth - overlayWidth) / 2;
            $(this).css({
                top: top + "px",
                left: left + "px"
            });
        });
    }

    function startTimer() {
        var seconds = 60; // Inicializamos el contador en 60 segundos
        var timerElement = document.getElementById("timer");

        var interval = setInterval(function () {
            seconds--;

            if (seconds > 0) {
                timerElement.textContent = "Se actualizará en " + seconds + " segundos";
            } else if (seconds === 0) {
                timerElement.textContent = "Actualizando las unidades!";
            }

            // Detener el contador cuando llegue a 0
            if (seconds === -5) {
                clearInterval(interval);
                // Reiniciar el contador después de 5 segundos
                setTimeout(startTimer, 5000);
            }
        }, 1000); // Actualiza cada segundo
    }

    // Llamar a la función al cargar la página y al redimensionar
    adjustOverlays();
    $(window).resize(adjustOverlays);

    $(document).ready(function () {
        // Escucha el evento clic en los botones de acordeón
        $('.accordion-button').click(function () {
            // Obtén el target del botón
            var target = $(this).data('bs-target');
            // Oculta todos los divs que no sean el que se está abriendo
            $('.collapse').not(target).collapse('hide');
        });

        startTimer();
    });
});

