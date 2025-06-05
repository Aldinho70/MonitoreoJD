<?php
class ConexionBD {
    public $conexion;

    public function conectar() {
        $servername =   "208.109.27.194";
        $username =     "super";
        $password =     "jornadadigital_2024";
        $dbname =       "monitoreo";

        // Crear conexión
        $this->conexion = new mysqli($servername, $username, $password, $dbname);

        // Verificar conexión
        if ($this->conexion->connect_error) {
            die("Connection failed: " . $this->conexion->connect_error);
        }
    }

    public function ejecutarConsulta($sql) {
        return $this->conexion->query($sql);
    }

    public function desconectar() {
        $this->conexion->close();
    }
}

?>
