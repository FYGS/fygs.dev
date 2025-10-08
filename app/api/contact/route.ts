import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { emailService, ContactFormData } from "@/lib/email-service";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  type: z.enum(['recruitment', 'collaboration', 'training', 'general']).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    // Prepare contact form data
    const contactData: ContactFormData = {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      type: validatedData.type || 'general',
      company: validatedData.company,
      position: validatedData.position,
    };

    // Check if email service is configured
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("Email service not configured");
      return NextResponse.json(
        { error: "Service d'email non configuré" },
        { status: 500 }
      );
    }

    // Send emails using the centralized email service
    const { adminSent, userSent } = await emailService.sendContactFormEmails(contactData);

    if (!adminSent || !userSent) {
      console.error("Failed to send emails:", { adminSent, userSent });
      return NextResponse.json(
        { error: "Échec de l'envoi d'email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Emails envoyés avec succès",
        data: { adminSent, userSent }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid form data", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
