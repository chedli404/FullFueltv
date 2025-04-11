import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Check, AlertCircle, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { insertSubscriberSchema } from '@shared/schema';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const newsletterSchema = insertSubscriberSchema.extend({
  agreedToMarketing: z.boolean()
    .refine(val => val === true, {
      message: 'You must agree to receive marketing emails.'
    })
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const AboutSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      name: '',
      email: '',
      agreedToMarketing: false,
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: NewsletterFormData) => {
      return apiRequest('POST', '/api/subscribe', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      reset();
      toast({
        title: "Subscription Successful!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: NewsletterFormData) => {
    subscribeMutation.mutate(data);
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-dark">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-bold text-3xl md:text-4xl mb-6">
              About <span className="text-primary">Full Fuel</span>
            </h2>
            <p className="text-lg mb-6">
              Full Fuel explores waves, by collecting the best music live sets & DJ mixes from Clubs & Festivals. 
              We provide the best performance to be bigger and better. An incredible talent will made the events 
              quite special.
            </p>
            <p className="text-lg mb-8">
              Founded in 2015, we've been at the forefront of electronic music culture, documenting and 
              broadcasting the most cutting-edge sounds from around the world.
            </p>

            <div className="flex space-x-6 mb-12">
              <a 
                href="https://www.youtube.com/c/FullFuel" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-8 w-8" />
              </a>
              <a 
                href="https://www.instagram.com/fullfuel.tv/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-8 w-8" />
              </a>
              <a 
                href="https://www.facebook.com/FullFuel.tv/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-8 w-8" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#contact" 
                className="bg-primary hover:bg-primary/80 text-dark px-6 py-3 text-center rounded-sm font-medium transition-colors uppercase"
              >
                Contact Us
              </a>
              <a 
                href="#" 
                className="bg-transparent border border-white hover:border-primary hover:text-primary text-white px-6 py-3 text-center rounded-sm font-medium transition-colors uppercase"
              >
                Partnerships
              </a>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-8 rounded-sm">
            <h3 className="font-bold text-2xl mb-6">Subscribe to Our Newsletter</h3>
            <p className="mb-6">Get the latest updates on events, exclusive mixes, and behind-the-scenes content.</p>

            {submitted ? (
              <div className="bg-primary/20 p-6 rounded-sm">
                <div className="flex items-center mb-4">
                  <Check className="h-8 w-8 text-primary mr-2" />
                  <h4 className="font-bold text-xl">Thank You!</h4>
                </div>
                <p>Your subscription has been confirmed. You'll be receiving our newsletters soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <input 
                    {...register('name')}
                    id="name" 
                    type="text" 
                    className={`w-full bg-dark border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-sm px-4 py-3 focus:outline-none focus:border-primary`} 
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    {...register('email')}
                    id="email" 
                    type="email" 
                    className={`w-full bg-dark border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-sm px-4 py-3 focus:outline-none focus:border-primary`} 
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="flex items-start">
                    <input 
                      {...register('agreedToMarketing')}
                      type="checkbox" 
                      className={`mt-1 mr-2 ${errors.agreedToMarketing ? 'border-red-500' : ''}`}
                    />
                    <span className="text-sm text-gray-400">
                      I agree to receive marketing emails from Full Fuel and understand I can unsubscribe at any time.
                    </span>
                  </label>
                  {errors.agreedToMarketing && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.agreedToMarketing.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/80 text-dark px-6 py-3 rounded-sm font-medium transition-colors uppercase"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
