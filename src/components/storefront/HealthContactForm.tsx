"use client";

import { useState } from "react";

export interface HealthContactFormProps {
  formTitle?: string;
  formSubtitle?: string;
}

export function HealthContactForm({
  formTitle = "Send Us a Message",
  formSubtitle = "We typically respond within 24 hours",
}: HealthContactFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const css = `
    .hh-contact-form-wrap { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 40px; }
    .hh-contact-form-title { font-family: 'Geologica', Arial, Helvetica, sans-serif; font-weight: 500; font-size: 24px; color: #1a1a1a; margin: 0 0 5px; }
    .hh-contact-form-sub { font-family: 'Geologica', Arial, Helvetica, sans-serif; font-size: 14px; color: #666; margin: 0 0 25px; }
    .hh-contact-field { margin-bottom: 18px; }
    .hh-contact-label { display: block; font-family: 'Geologica', Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .hh-contact-input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Geologica', Arial, Helvetica, sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .hh-contact-input:focus { border-color: #88ad99; }
    .hh-contact-textarea { min-height: 120px; resize: vertical; }
    .hh-contact-submit { display: inline-block; padding: 14px 35px; background: #88ad99; color: #fff; border: none; border-radius: 35px; font-family: 'Geologica', Arial, Helvetica, sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.3s; }
    .hh-contact-submit:hover { filter: brightness(0.9); }
    .hh-contact-success { text-align: center; padding: 40px 20px; }
    .hh-contact-success-icon { font-size: 48px; margin-bottom: 15px; }
    .hh-contact-success h3 { font-family: 'Geologica', Arial, Helvetica, sans-serif; font-size: 24px; color: #1a1a1a; margin: 0 0 10px; }
    .hh-contact-success p { font-family: 'Geologica', Arial, Helvetica, sans-serif; font-size: 15px; color: #666; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hh-contact-form-wrap">
        {submitted ? (
          <div className="hh-contact-success">
            <div className="hh-contact-success-icon">✅</div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. We&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <>
            <h3 className="hh-contact-form-title">{formTitle}</h3>
            <p className="hh-contact-form-sub">{formSubtitle}</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div className="hh-contact-field">
                  <label className="hh-contact-label">Name</label>
                  <input className="hh-contact-input" type="text" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="hh-contact-field">
                  <label className="hh-contact-label">Email</label>
                  <input className="hh-contact-input" type="email" placeholder="Your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              <div className="hh-contact-field">
                <label className="hh-contact-label">Subject</label>
                <input className="hh-contact-input" type="text" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div className="hh-contact-field">
                <label className="hh-contact-label">Message</label>
                <textarea className="hh-contact-input hh-contact-textarea" placeholder="Tell us more..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
              </div>
              <button className="hh-contact-submit" type="submit">Send Message</button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
