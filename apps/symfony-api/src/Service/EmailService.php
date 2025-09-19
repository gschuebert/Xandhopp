<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class EmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private string $fromEmail = 'noreply@xandhopp.com',
        private string $fromName = 'Xandhopp'
    ) {}

    public function sendVerificationEmail(string $toEmail, string $firstName, string $verificationToken): void
    {
        $verificationUrl = "http://localhost:3000/verify-email?token={$verificationToken}";
        
        $email = (new Email())
            ->from(new Address($this->fromEmail, $this->fromName))
            ->to($toEmail)
            ->subject('Verify your email address - Xandhopp')
            ->html($this->getVerificationEmailTemplate($firstName, $verificationUrl));

        $this->mailer->send($email);
    }

    public function sendWelcomeEmail(string $toEmail, string $firstName): void
    {
        $email = (new Email())
            ->from(new Address($this->fromEmail, $this->fromName))
            ->to($toEmail)
            ->subject('Welcome to Xandhopp!')
            ->html($this->getWelcomeEmailTemplate($firstName));

        $this->mailer->send($email);
    }

    private function getVerificationEmailTemplate(string $firstName, string $verificationUrl): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Verify your email</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #2563eb;'>Xandhopp</h1>
            </div>
            
            <h2>Hello {$firstName}!</h2>
            
            <p>Thank you for registering with Xandhopp. To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{$verificationUrl}' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style='word-break: break-all; color: #666;'>{$verificationUrl}</p>
            
            <p>This link will expire in 24 hours.</p>
            
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #666;'>If you didn't create an account with Xandhopp, please ignore this email.</p>
        </body>
        </html>
        ";
    }

    private function getWelcomeEmailTemplate(string $firstName): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Welcome to Xandhopp</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #2563eb;'>Xandhopp</h1>
            </div>
            
            <h2>Welcome to Xandhopp, {$firstName}!</h2>
            
            <p>Your email has been successfully verified and your account is now active.</p>
            
            <p>You can now:</p>
            <ul>
                <li>Complete your profile</li>
                <li>Explore our features</li>
                <li>Connect with other users</li>
            </ul>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:3000/login' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>Login to Your Account</a>
            </div>
            
            <p>Thank you for joining Xandhopp!</p>
            
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #666;'>This email was sent to you because you registered an account with Xandhopp.</p>
        </body>
        </html>
        ";
    }
}
