<?php
require_once __DIR__ . '/env.php';

class SmtpMailer {
    private string $host;
    private int    $port;
    private string $username;
    private string $password;
    private string $fromEmail;
    private string $fromName;

    public function __construct() {
        $this->host      = getenv('SMTP_HOST')       ?: 'smtp.gmail.com';
        $this->port      = (int)(getenv('SMTP_PORT') ?: 587);
        $this->username  = getenv('SMTP_USER')       ?: '';
        $this->password  = getenv('SMTP_PASS')       ?: '';
        $this->fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'noreply@lexstudio.com';
        $this->fromName  = getenv('SMTP_FROM_NAME')  ?: 'Lex Studio';
    }

    public function configurado(): bool {
        return $this->username !== '' && $this->password !== ''
            && $this->username !== 'seu@gmail.com';
    }

    public function send(string $toEmail, string $toName, string $subject, string $html): bool {
        if (!$this->configurado()) {
            error_log("[Lex Email] SMTP não configurado. Defina SMTP_USER/SMTP_PASS no .env");
            return false;
        }

        $sock = null;
        try {
            $sock = @stream_socket_client(
                "tcp://{$this->host}:{$this->port}",
                $errno, $errstr, 15
            );
            if (!$sock) throw new Exception("Conexão SMTP falhou: $errstr ($errno)");

            stream_set_timeout($sock, 15);
            $this->read($sock);                                   // 220 greeting

            $this->cmd($sock, "EHLO lexstudio.local", 250);
            $this->cmd($sock, "STARTTLS", 220);

            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("Falha ao iniciar TLS");
            }

            $this->cmd($sock, "EHLO lexstudio.local", 250);
            $this->cmd($sock, "AUTH LOGIN", 334);
            $this->cmd($sock, base64_encode($this->username), 334);
            $this->cmd($sock, base64_encode($this->password), 235);
            $this->cmd($sock, "MAIL FROM:<{$this->fromEmail}>", 250);
            $this->cmd($sock, "RCPT TO:<{$toEmail}>", 250);
            $this->cmd($sock, "DATA", 354);

            $encodedBody = chunk_split(base64_encode($html));
            $msg = "From: =?UTF-8?B?" . base64_encode($this->fromName) . "?= <{$this->fromEmail}>\r\n"
                 . "To: =?UTF-8?B?"   . base64_encode($toName)         . "?= <{$toEmail}>\r\n"
                 . "Subject: =?UTF-8?B?" . base64_encode($subject)     . "?=\r\n"
                 . "MIME-Version: 1.0\r\n"
                 . "Content-Type: text/html; charset=UTF-8\r\n"
                 . "Content-Transfer-Encoding: base64\r\n"
                 . "Date: " . date('r') . "\r\n"
                 . "\r\n"
                 . $encodedBody
                 . "\r\n.";

            fwrite($sock, $msg . "\r\n");
            $this->read($sock);                                   // 250 OK
            $this->cmd($sock, "QUIT", 221);
            fclose($sock);
            return true;

        } catch (Exception $e) {
            error_log("[Lex Email] " . $e->getMessage());
            if ($sock) @fclose($sock);
            return false;
        }
    }

    private function cmd($sock, string $cmd, int $expected): string {
        fwrite($sock, $cmd . "\r\n");
        $resp = $this->read($sock);
        $code = (int)substr(trim($resp), 0, 3);
        if ($code !== $expected) {
            throw new Exception("SMTP: esperado $expected, recebido: " . trim($resp));
        }
        return $resp;
    }

    private function read($sock): string {
        $data = '';
        while ($line = fgets($sock, 1024)) {
            $data .= $line;
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $data;
    }
}

function emailReset(string $email, string $nome, string $link): bool {
    $html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Lex Studio</title></head>
<body style="margin:0;padding:0;background:#0b0c0f;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
  <table width="560" cellpadding="0" cellspacing="0"
         style="background:#111318;border-radius:12px;overflow:hidden;border:1px solid #262b36">
    <tr><td style="padding:28px 40px;border-bottom:1px solid #1a1f2a;text-align:center">
      <span style="font-size:22px;font-weight:900;color:#c9a84c;letter-spacing:-0.5px">⚖️ Lex Studio</span>
    </td></tr>
    <tr><td style="padding:40px 40px 32px">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#eeebe2">Recuperar sua senha</h1>
      <p style="margin:0 0 16px;color:#8e8b82;font-size:15px;line-height:1.6">
        Olá, <strong style="color:#eeebe2">$nome</strong>!<br>
        Recebemos uma solicitação para redefinir a senha da sua conta.
      </p>
      <p style="margin:0 0 28px;color:#8e8b82;font-size:15px;line-height:1.6">
        Este link é válido por <strong style="color:#c9a84c">1 hora</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
        <a href="$link"
           style="display:inline-block;padding:14px 32px;background:#c9a84c;color:#0b0c0f;
                  font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">
          Redefinir senha →
        </a>
      </td></tr></table>
      <p style="margin:28px 0 0;font-size:13px;color:#4a4844;line-height:1.6">
        Se você não solicitou isso, ignore este e-mail. Nenhuma alteração será feita.
      </p>
    </td></tr>
    <tr><td style="padding:20px 40px;background:#0d0f14;text-align:center">
      <p style="margin:0;font-size:12px;color:#4a4844">© 2026 Lex Studio · Plataforma de Estudos Jurídicos</p>
    </td></tr>
  </table>
</td></tr></table>
</body>
</html>
HTML;

    return (new SmtpMailer())->send($email, $nome, 'Recuperação de Senha — Lex Studio', $html);
}
