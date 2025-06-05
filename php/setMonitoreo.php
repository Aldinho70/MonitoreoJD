<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    require 'ConexionBD.php';

    $conexion = new ConexionBD();
    $conexion->conectar();

    // Obtener los datos en formato JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar y sanitizar los datos
    if (isset($data['atendida'])) {
        $name_unidad = $conexion->conexion->real_escape_string($data['name_unidad']);
        $timestamp = $conexion->conexion->real_escape_string($data['timestamp']);
        $atendida = $conexion->conexion->real_escape_string($data['atendida']);
        $timestamp_atendida = time();
        $name_user = $conexion->conexion->real_escape_string($data['name_user']);
        $monitorista = $conexion->conexion->real_escape_string($data['monitorista']);

        // Actualizar en la base de datos
        $SQL = "UPDATE `notificaciones` SET `atendida` ='$atendida', `hora_atendida` ='$timestamp_atendida' WHERE `unidad` = '$name_unidad' AND `hora` = '$timestamp'";

        //Envio de correos
        if ($conexion->ejecutarConsulta($SQL)) {
            // Parámetros para la función mail()
            // $to = 'aldinhobobadilla@gmail.com, alu.19130509@correo.itlalaguna.edu.mx';
            // $subject = 'Aviso de notificaciones';
            // $message = $monitorista .' atendio la notificacion de la unidad <b>' . $name_unidad . ' de '. $name_user .'</b>';
            // $headers = "MIME-Version: 1.0" . "\r\n";
            // $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            // $headers .= 'From: jmbobadilla_nullpointer@jornadadigital.com' . "\r\n";

            // // Enviar el correo
            // if (mail($to, $subject, $message, $headers)) {
            //     echo 'Message has been sent';
            // } else {
            //     echo 'Message could not be sent.';
            // }
        } else {
            echo json_encode(array('success' => false, 'message' => 'Error: ' . $conexion->conexion->error));
        }
    } else {
        echo json_encode(array('success' => false, 'message' => 'Error, no se recibieron datos JSON'));
    }

    $conexion->desconectar();
} else {
    // Manejar el caso en que no se recibieron datos mediante POST
    echo json_encode(array('success' => false, 'message' => 'Error: No se recibieron datos mediante POST.'));
}
?>
