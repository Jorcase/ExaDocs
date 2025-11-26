<?php

namespace App\Mail;

use App\Models\Archivo;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArchivoActualizadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Archivo $archivo, public ?User $actor = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('no-reply@exadocs.com', 'ExaDocs'),
            subject: 'Tu archivo fue actualizado: ' . $this->archivo->titulo,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.archivo_actualizado',
            with: [
                'archivo' => $this->archivo,
                'actor' => $this->actor,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
