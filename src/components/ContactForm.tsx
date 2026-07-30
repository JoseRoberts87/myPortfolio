'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
  phone?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 5000) {
      newErrors.message = 'Message must be less than 5000 characters';
    }

    // Optional field validation (only if provided)
    if (formData.company && formData.company.trim().length > 100) {
      newErrors.company = 'Company name must be less than 100 characters';
    }

    if (formData.phone && formData.phone.trim().length > 20) {
      newErrors.phone = 'Phone number must be less than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const API_V1 = `${API_URL}/api/v1`;
      const response = await fetch(`${API_V1}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Thank you for your message! I\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          company: '',
          phone: '',
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.detail || 'Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to send message. Please try again later or contact me directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared input styling. Previously used an undefined `primary-500` token, so
  // the focus state was invisible (WCAG 2.4.7); this uses the real purple accent
  // and a visible focus ring.
  const fieldClasses = (hasError: boolean) =>
    `w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
      hasError ? 'border-red-500' : 'border-slate-300 dark:border-gray-700'
    } rounded-lg transition-colors focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40`;

  return (
    <Card variant="elevated" padding="lg">
      <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
      <p className="text-muted mb-6">
        Have a question or want to work together? I'd love to hear from you.
      </p>

      {/* Availability, location, and direct links */}
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>
          Open to Data &amp; AI Architect roles
        </span>
        <span className="inline-flex items-center gap-2 text-muted">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Providence, RI
        </span>
        <a
          href="https://www.linkedin.com/in/jose-roberts"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
      </div>

      {submitStatus === 'success' && (
        <div role="status" aria-live="polite" className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <p className="text-green-500">{submitMessage}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-500">{submitMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              aria-required="true"
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={fieldClasses(!!errors.name)}
              placeholder="John Doe"
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={fieldClasses(!!errors.email)}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Company (Optional) */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              maxLength={100}
              aria-invalid={errors.company ? 'true' : undefined}
              aria-describedby={errors.company ? 'company-error' : undefined}
              className={fieldClasses(!!errors.company)}
              placeholder="Acme Inc."
            />
            {errors.company && (
              <p id="company-error" role="alert" className="mt-1 text-sm text-red-500">{errors.company}</p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              aria-invalid={errors.phone ? 'true' : undefined}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={fieldClasses(!!errors.phone)}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={200}
            aria-required="true"
            aria-invalid={errors.subject ? 'true' : undefined}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            className={fieldClasses(!!errors.subject)}
            placeholder="Project Inquiry"
          />
          {errors.subject && (
            <p id="subject-error" role="alert" className="mt-1 text-sm text-red-500">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            maxLength={5000}
            aria-required="true"
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={`${fieldClasses(!!errors.message)} resize-vertical`}
            placeholder="Tell me about your project..."
          />
          {errors.message && (
            <p id="message-error" role="alert" className="mt-1 text-sm text-red-500">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </Card>
  );
}
