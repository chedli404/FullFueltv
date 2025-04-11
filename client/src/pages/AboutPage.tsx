import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const subscriberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

const AboutPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      marketingConsent: false,
    },
  });
  
  const onSubmit = async (data: SubscriberFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/subscribers", {
        name: data.name,
        email: data.email,
        marketingConsent: data.marketingConsent,
        subscribeDate: new Date()
      });
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>About | Full Fuel TV</title>
        <meta name="description" content="Learn about Full Fuel TV - your source for the best electronic music content from around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-primary">Full Fuel</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Your source for the best electronic music content from around the world.
            </p>
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-16 bg-dark">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-6 text-gray-300">
                  <p>
                    Full Fuel explores waves, by collecting the best music live sets & DJ mixes from Clubs & Festivals. 
                    We provide the best performance to be bigger and better. An incredible talent will made the events 
                    quite special.
                  </p>
                  <p>
                    Founded in 2015, we've been at the forefront of electronic music culture, documenting and 
                    broadcasting the most cutting-edge sounds from around the world.
                  </p>
                  <p>
                    Our mission is to connect electronic music lovers with authentic live experiences, whether 
                    through streaming sets from major festivals, showcasing talented DJs in intimate club settings, 
                    or bringing exclusive performances to your screens.
                  </p>
                  <p>
                    We're passionate about supporting the electronic music community and providing a platform for 
                    artists, events, and fans to come together and celebrate the music we love.
                  </p>
                </div>
                
                <h2 className="text-3xl font-bold mt-12 mb-6">Connect With Us</h2>
                <div className="flex space-x-6 mb-12">
                  <a 
                    href="https://www.youtube.com/c/FullFuel" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-primary transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/fullfuel.tv/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.facebook.com/FullFuel.tv/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <a 
                    href="mailto:info@fullfuel.tv" 
                    className="bg-primary hover:bg-primary/80 text-dark px-6 py-3 text-center rounded-sm font-medium transition-colors uppercase"
                  >
                    Contact Us
                  </a>
                  <a 
                    href="#partners" 
                    className="bg-transparent border border-white hover:border-primary hover:text-primary text-white px-6 py-3 text-center rounded-sm font-medium transition-colors uppercase"
                  >
                    Partnerships
                  </a>
                </div>
              </div>
              
              {/* Contact/Newsletter Form */}
              <div className="bg-[#1A1A1A] p-8 rounded-sm">
                {!submitted ? (
                  <>
                    <h3 className="font-bold text-2xl mb-6">Get In Touch</h3>
                    <p className="mb-6">Subscribe to our newsletter or send us a message. We'd love to hear from you!</p>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your name" 
                                  {...field} 
                                  className="w-full bg-dark border border-gray-700 rounded-sm px-4 py-3 focus:outline-none focus:border-primary" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your email address" 
                                  type="email" 
                                  {...field} 
                                  className="w-full bg-dark border border-gray-700 rounded-sm px-4 py-3 focus:outline-none focus:border-primary" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Your message..." 
                                  {...field} 
                                  className="w-full bg-dark border border-gray-700 rounded-sm px-4 py-3 focus:outline-none focus:border-primary min-h-[120px]" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="marketingConsent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm text-gray-400">
                                  I agree to receive marketing emails from Full Fuel and understand I can unsubscribe at any time.
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-primary hover:bg-primary/80 text-dark px-6 py-3 rounded-sm font-medium transition-colors uppercase"
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                    <p className="text-gray-400">Your message has been sent and you've been subscribed to our newsletter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Partners Section */}
        <section id="partners" className="py-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold mb-12 text-center">Our <span className="text-primary">Partners</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="text-center">
                <div className="bg-[#1A1A1A] p-8 rounded-sm h-32 w-full flex items-center justify-center">
                  <span className="text-xl text-gray-500">Partner Logo</span>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-[#1A1A1A] p-8 rounded-sm h-32 w-full flex items-center justify-center">
                  <span className="text-xl text-gray-500">Partner Logo</span>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-[#1A1A1A] p-8 rounded-sm h-32 w-full flex items-center justify-center">
                  <span className="text-xl text-gray-500">Partner Logo</span>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-[#1A1A1A] p-8 rounded-sm h-32 w-full flex items-center justify-center">
                  <span className="text-xl text-gray-500">Partner Logo</span>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-6">Become a Partner</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Interested in partnering with Full Fuel TV? We work with festivals, clubs, music labels, and brands 
                that share our passion for electronic music culture.
              </p>
              <a 
                href="mailto:partnerships@fullfuel.tv" 
                className="inline-block bg-primary hover:bg-primary/80 text-dark px-8 py-3 rounded-sm font-medium transition-colors uppercase"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
