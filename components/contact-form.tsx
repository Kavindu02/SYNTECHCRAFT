"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight } from "lucide-react"
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
        className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-14"
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
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                  Let&apos;s talk.
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 text-base md:text-lg">
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-black dark:text-zinc-300 ml-1">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              className="h-14 bg-white/40 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:border-[#ffb400] dark:text-white focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-black dark:text-zinc-300 ml-1">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              className="h-14 bg-white/40 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:border-[#ffb400] dark:text-white focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
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
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-black dark:text-zinc-300 ml-1">Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="" 
                            {...field} 
                            className="h-14 bg-white/40 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:border-[#ffb400] dark:text-white focus:ring-2 focus:ring-[#ffb400] transition-all rounded-2xl"
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
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-black dark:text-zinc-300 ml-1">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="" 
                            className="min-h-[160px] bg-white/40 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:border-[#ffb400] dark:text-white focus:ring-2 focus:ring-[#ffb400] transition-all rounded-3xl p-6 resize-none"
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
                    className="w-full h-16 bg-black text-white dark:bg-white dark:text-black hover:bg-[#ffb400] hover:text-black dark:hover:bg-[#ffb400] dark:hover:text-black rounded-2xl text-md font-bold uppercase tracking-[0.2em] transition-all group overflow-hidden shadow-lg"
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
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mb-4">
                <motion.svg
                  className="w-12 h-12 text-emerald-600 dark:text-emerald-400"
                  viewBox="0 0 100 100"
                  initial="hidden"
                  animate="visible"
                >
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      visible: {
                        pathLength: 1,
                        opacity: 1,
                        transition: { duration: 0.6, ease: "easeInOut" }
                      }
                    }}
                  />
                  <motion.path
                    d="M30 52 L45 67 L70 38"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      visible: {
                        pathLength: 1,
                        opacity: 1,
                        transition: { delay: 0.5, duration: 0.4, ease: "easeOut" }
                      }
                    }}
                  />
                </motion.svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Message Received!</h3>
              <p className="text-slate-500 dark:text-zinc-400 max-w-sm text-lg">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mt-6 rounded-full px-8 h-12 border-2 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
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