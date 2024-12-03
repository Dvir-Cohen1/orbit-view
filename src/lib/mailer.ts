'use server';
import { Resend } from 'resend';
export interface EmailOptions {
    fromEmail: string;
    fromName: string;
    fromPhone: string;
    subject: string;
    text: string;
}

export async function sendEmail(options: EmailOptions): Promise<void | null> {
    try {
        const resend = new Resend(process.env.RESEND_KEY);

        const { fromEmail, fromName, fromPhone, subject, text } = options;

        const { data }: any = await resend.emails.send({
            from: `${fromEmail} <onboarding@resend.dev>`,
            to: 'cohendvirdev@gmail.com',
            subject: `${fromName} ${subject}`,
            html: `<h1>New Job Opportunity</h1><br/><p>${fromPhone}</p><br/><p>${text}</p>`,
        });

        if (data.error) {
            console.log('Error sending email');
        } else {
            console.log('Email sent successfully');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}
