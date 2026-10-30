// src/components/page/contact-form.tsx
"use client";
import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/page/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";

export type FormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  // Note: 'plan' won't be part of formData if it's dynamically added to the message string
};

export type ContactFormVariant = "full" | "maintenance";

interface ContactFormProps {
  variant: ContactFormVariant;
  serviceType?: "React" | "WordPress"; // Optional prop for maintenance forms
  plusPlanLabel?: "Performance" | "SEO"; // New prop for the "Plus" plan label
  delay?: number;
  className?: string;
  id?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  variant,
  serviceType,
  plusPlanLabel, // Destructure new prop
  delay = 0.2,
  className,
  id,
}) => {
  const createMessage = useMutation(api.contactMessages.create);
  const formRef = useRef<HTMLFormElement>(null);

  const defaultBasicMessage = `I'm interested in your ${serviceType} maintenance services. Could you tell me more?`;
  const defaultPlusMessage = `I'm interested in "The Action Plan (With ${plusPlanLabel})" for your ${serviceType} maintenance services. Could you tell me more?`;

  const [selectedPlan, setSelectedPlan] = useState<"basic" | "plus">("basic"); // New state for plan selection

  // Memoized initial message based on variant, serviceType, and selectedPlan
  const initialMessage = useMemo(() => {
    if (variant === "maintenance" && serviceType) {
      return selectedPlan === "basic"
        ? defaultBasicMessage
        : defaultPlusMessage;
    }
    return ""; // Default empty message for the full form
  }, [
    variant,
    serviceType,
    selectedPlan,
    defaultBasicMessage,
    defaultPlusMessage,
  ]); // Added default messages to dependencies

  // Helper to determine the source for Convex based on variant and serviceType
  const getSource = (
    currentVariant: ContactFormVariant,
    currentServiceType?: "React" | "WordPress"
  ) => {
    if (currentVariant === "maintenance" && currentServiceType) {
      return `${currentServiceType.toLowerCase()}-maintenance-page`;
    }
    return "contact-page"; // Default source for the full form
  };

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: initialMessage, // Initialized correctly
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset the message when the caller swaps in a new one (e.g. plan selection
  // changes). Adjusting state during render rather than in an effect keeps the
  // stale message from painting for a frame first.
  // https://react.dev/learn/you-might-not-need-an-effect
  const [prevInitialMessage, setPrevInitialMessage] = useState(initialMessage);
  if (initialMessage !== prevInitialMessage) {
    setPrevInitialMessage(initialMessage);
    setFormData((prev) => ({ ...prev, message: initialMessage }));
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    const problems = Object.values(newErrors);
    // The toast sums it up; each field still keeps its own message for screen readers.
    if (problems.length) {
      toast.error(problems.length === 1 ? problems[0] : `Please fix ${problems.length} fields`, {
        description: problems.length === 1 ? undefined : problems.join(" · "),
      });
    }
    const firstInvalid = formRef.current?.elements.namedItem(Object.keys(newErrors)[0] ?? "");
    if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
    return problems.length === 0;
  };

  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalSource = getSource(variant, serviceType);

      await createMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        message: formData.message.trim(), // Use the current formData.message, which is kept in sync
        source: finalSource,
      });
      toast.success("Message sent", { description: "Thanks for reaching out. I’ll get back to you soon." });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: initialMessage, // CORRECTED: Use the memoized initialMessage here
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to send message:", error);
      // Server validation and rate-limit errors carry a readable message.
      toast.error("Message not sent", {
        description:
          error instanceof ConvexError && typeof error.data === "string"
            ? error.data
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <motion.div
      id={id} // PASSED HERE: id prop
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`${variant === "full" ? "mt-8" : ""} ${className || ""}`}
    >
      <Card size="full">
        <form ref={formRef} noValidate onSubmit={handleSubmitInternal} className="space-y-6" aria-busy={isSubmitting}>
          <div>
            <label htmlFor="name" className="block mb-2">
              Name *
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              aria-required="true"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-(color:--color-danger)" : ""}
              placeholder="John Doe"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p id="name-error" className="mt-1 text-(--color-danger)" role="alert">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block mb-2">
              Email *
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              aria-required="true"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-(color:--color-danger)" : ""}
              placeholder="john@example.com"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-(--color-danger)" role="alert">{errors.email}</p>
            )}
          </div>
          {/* Phone field only for 'full' contact form variant */}
          {variant === "full" && (
            <div>
              <label htmlFor="phone" className="block mb-2">
                Phone (optional)
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "border-(color:--color-danger)" : ""}
                placeholder="(123) 456-7890"
                aria-describedby={errors.phone ? "phone-error" : undefined}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-(--color-danger)" role="alert">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Plan selection for maintenance forms */}
          {variant === "maintenance" && serviceType && plusPlanLabel && (
            <fieldset>
              <legend className="block mb-2">Choose An Action Plan</legend>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="basic"
                    checked={selectedPlan === "basic"}
                    onChange={() => setSelectedPlan("basic")}
                    className="text-accent"
                  />
                  <span className="">The Action Plan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="plus"
                    checked={selectedPlan === "plus"}
                    onChange={() => setSelectedPlan("plus")}
                    className="text-accent"
                  />
                  <span className="">
                    The Action Plan Plus (With {plusPlanLabel})
                  </span>
                </label>
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor="message" className="block mb-2">
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              aria-required="true"
              value={formData.message}
              onChange={handleChange}
              rows={variant === "full" ? 6 : 3} // Dynamic rows based on variant
              className={errors.message ? "border-(color:--color-danger)" : ""}
              placeholder={
                variant === "full"
                  ? "Tell me about your project or inquiry..."
                  : "I'm interested in your services..."
              }
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-(--color-danger)" role="alert">{errors.message}</p>
            )}
            {/* Character count only for 'full' contact form variant */}
            {variant === "full" && (
              <p className="mt-1 text-sm text-muted">
                {formData.message.length} characters
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="radio"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default ContactForm;
