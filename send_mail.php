<?php
// Configuración de cabeceras de seguridad
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Solo aceptar peticiones POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit;
}

// 1. Limpieza y validación de los datos entrantes (Sanitización)
$ruc = filter_input(INPUT_POST, 'ruc', FILTER_SANITIZE_STRING) ?? '';
$nombre = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_STRING) ?? '';
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '';
$mensaje = filter_input(INPUT_POST, 'mensaje', FILTER_SANITIZE_STRING) ?? '';

if (empty($ruc) || empty($nombre) || empty($email) || empty($mensaje)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit;
}

if (!preg_match('/^[0-9]{8,11}$/', $ruc)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "RUC o DNI inválido."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Correo electrónico no válido."]);
    exit;
}

// 2. Incluir PHPMailer (Asegúrate de haberlo instalado vía Composer o incluir sus archivos manualmente)
// require 'vendor/autoload.php'; // Usa esto si instalaste con Composer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Si no usas Composer, descomenta las siguientes líneas y ajusta las rutas a tu instalación manual:
// require 'Ruta/Hacia/PHPMailer/src/Exception.php';
// require 'Ruta/Hacia/PHPMailer/src/PHPMailer.php';
// require 'Ruta/Hacia/PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    // 3. Configuración del Servidor SMTP
    // =========================================================
    // INSERTA AQUÍ TUS CREDENCIALES DE SMTP (Hostinger, cPanel, etc)
    // =========================================================
    $mail->isSMTP();
    $mail->Host       = 'smtp.tudominio.com';       // <-- TU SERVIDOR SMTP
    $mail->SMTPAuth   = true;
    $mail->Username   = 'tu_correo@tudominio.com';  // <-- TU USUARIO/CORREO SMTP
    $mail->Password   = 'tu_contraseña_smtp';       // <-- TU CONTRASEÑA SMTP
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // O usa PHPMailer::ENCRYPTION_STARTTLS para puerto 587
    $mail->Port       = 465;                        // <-- PUERTO SMTP (Usualmente 465 o 587)
    $mail->CharSet    = 'UTF-8';

    // 4. Configuración de Remitente y Destinatarios
    $mail->setFrom('tu_correo@tudominio.com', 'Web Corporativa ESGO'); // <-- Debe coincidir con el Username
    $mail->addAddress('sgsesgo@gmail.com', 'SGS ESGO');
    $mail->addAddress('consultoramauro@gmail.com', 'Consultora Mauro');
    $mail->addReplyTo($email, $nombre); // Para responder directo al cliente

    // 5. Contenido del Correo
    $mail->isHTML(true);
    $mail->Subject = 'Nueva Solicitud de Cotización - Sitio Web Corporativo';
    
    $body = "<h2>Nueva solicitud recibida desde el portal web</h2>";
    $body .= "<p><strong>RUC/DNI:</strong> " . htmlspecialchars($ruc) . "</p>";
    $body .= "<p><strong>Razón Social / Nombre:</strong> " . htmlspecialchars($nombre) . "</p>";
    $body .= "<p><strong>Correo del cliente:</strong> " . htmlspecialchars($email) . "</p>";
    $body .= "<p><strong>Requerimiento:</strong></p>";
    $body .= "<blockquote>" . nl2br(htmlspecialchars($mensaje)) . "</blockquote>";
    $body .= "<hr><p><small>Este mensaje fue enviado automáticamente desde el formulario seguro de esgocorporativo.com usando PHPMailer</small></p>";

    $mail->Body = $body;
    $mail->AltBody = strip_tags(str_replace("<br>", "\n", $body));

    $mail->send();
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Correo enviado correctamente."]);
} catch (Exception $e) {
    http_response_code(500);
    // En producción evita mostrar el $mail->ErrorInfo completo por seguridad
    echo json_encode(["status" => "error", "message" => "Error al enviar el correo. Configure correctamente su SMTP."]);
}
?>
