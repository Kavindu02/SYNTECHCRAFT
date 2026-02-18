"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter a valid Name." }),
  email: z.string().email({ message: "Please enter a valid Email Address." }),
  subject: z.string().min(1, { message: "Please enter a valid Subject." }),
  message: z.string().min(1, { message: "Message cannot be Empty." }),
})

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setIsSubmitted(true)
      toast.success("Message sent successfully!")
      form.reset()
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative p-1">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-14"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form-content"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                  Let&apos;s talk.
                </h2>
                <p className="text-slate-500 text-base md:text-lg">
                  Have a project in mind? We&apos;d love to hear from you.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-black ml-1">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              className="h-14 bg-white/40 border-slate-200 focus:bg-white focus:border-[#ffb400] focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
                            />
                          </FormControl>
                          <FormMessage className="text-xs font-medium" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-black ml-1">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              className="h-14 bg-white/40 border-slate-200 focus:bg-white focus:border-[#ffb400] focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
                            />
                          </FormControl>
                          <FormMessage className="text-xs font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-black ml-1">Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="" 
                            {...field} 
                            className="h-14 bg-white/40 border-slate-200 focus:bg-white focus:border-[#ffb400] focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-black ml-1">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="" 
                            className="min-h-[160px] bg-white/40 border-slate-200 focus:bg-white focus:border-[#ffb400] focus:ring-2 focus:ring-[#ffb400] transition-all rounded-3xl p-6 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 bg-black text-white hover:bg-[#ffb400] hover:text-black rounded-2xl text-md font-bold uppercase tracking-[0.2em] transition-all group overflow-hidden shadow-lg"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Send Message</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div 
              key="success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-slate-500 max-w-sm text-lg">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mt-6 rounded-full px-8 h-12 border-2 font-bold hover:bg-slate-50"
              >
                Send Another Message
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}