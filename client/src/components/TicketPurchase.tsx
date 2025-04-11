import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/ui/auth/AuthDialog';
import { StripePaymentForm } from '@/components/ui/payment/StripePaymentForm';

// Define the Event type directly since importing from shared/schema isn't working
interface Event {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
  imageUrl?: string;
  eventType: 'festival' | 'club' | 'livestream';
  attending?: number;
  link?: string;
  featured?: boolean;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, CreditCard, Clock, User, AtSign } from 'lucide-react';

// Payment validation schema
const paymentSchema = z.object({
  quantity: z.union([
    z.string().min(1, { message: "Quantity is required" }).transform(val => Number(val)),
    z.number().min(1, { message: "Quantity is required" })
  ]),
  paymentMethod: z.enum(['credit', 'paypal', 'stripe'], { required_error: "Payment method is required" }),
  cardNumber: z.string().min(16, { message: "Card number must be at least 16 digits" }).optional(),
  cardExpiry: z.string().min(5, { message: "Expiry date should be in MM/YY format" }).optional(),
  cardCVC: z.string().min(3, { message: "CVC must be at least 3 digits" }).optional(),
  billingAddress: z.string().min(8, { message: "Please enter your billing address" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface TicketPurchaseProps {
  event: Event;
  buttonText?: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'xl';
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export default function TicketPurchase({ 
  event, 
  buttonText = 'Buy Tickets', 
  buttonSize = 'default',
  buttonVariant = 'default',
  className = ''
}: TicketPurchaseProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [, setLocation] = useLocation();
  const token = localStorage.getItem('auth_token');
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Create form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      quantity: '1', // This will be transformed to a number by the schema
      paymentMethod: 'credit',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
      billingAddress: '',
      email: user?.email || '',
    },
  });

  const watchPaymentMethod = form.watch('paymentMethod');

  // Purchase tickets mutation
  const purchaseTicketsMutation = useMutation({
    mutationFn: (data: PaymentFormValues) =>
      apiRequest('/api/tickets/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity: data.quantity,
          paymentMethod: data.paymentMethod,
          paymentDetails: {
            cardNumber: data.cardNumber,
            expiryDate: data.cardExpiry,
            cvv: data.cardCVC,
            billingAddress: data.billingAddress,
            email: data.email,
          },
        }),
      }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Tickets Purchased!',
          description: `You have successfully purchased tickets for ${event.title}.`,
        });
        setIsOpen(false);
        form.reset();
        // Redirect to profile page to view tickets
        setTimeout(() => {
          setLocation('/profile');
        }, 2000);
      } else {
        toast({
          title: 'Purchase Failed',
          description: data.message || 'Failed to purchase tickets. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An error occurred during the purchase process.',
        variant: 'destructive',
      });
    },
  });

  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    // If dialog is closing, reset form state
    if (!open) {
      form.reset();
      setAuthRequired(false);
    }
    
    setIsOpen(open);
  };

  // Handle buy tickets click
  const handleBuyTickets = () => {
    if (!isAuthenticated) {
      setAuthRequired(true);
    } else {
      setIsOpen(true);
    }
  };

  // Watch for payment method changes
  useEffect(() => {
    if (watchPaymentMethod === 'stripe') {
      setShowStripeForm(true);
    } else {
      setShowStripeForm(false);
    }
  }, [watchPaymentMethod]);

  // Update ticket quantity whenever form changes
  useEffect(() => {
    const quantity = form.watch('quantity');
    setTicketQuantity(Number(quantity));
  }, [form]);

  // Handle Stripe payment success
  const handleStripeSuccess = () => {
    toast({
      title: 'Tickets Purchased!',
      description: `You have successfully purchased tickets for ${event.title}.`,
    });
    setIsOpen(false);
    form.reset();
    // Redirect to profile page to view tickets
    setTimeout(() => {
      setLocation('/profile');
    }, 2000);
  };
  
  // Handle Stripe payment error
  const handleStripeError = (error: Error) => {
    toast({
      title: 'Payment Failed',
      description: error.message || 'An error occurred during payment processing.',
      variant: 'destructive',
    });
  };

  // Form submission handler
  const onSubmit = (data: PaymentFormValues) => {
    if (data.paymentMethod === 'stripe') {
      // Stripe is handled separately via the StripePaymentForm component
      return;
    }
    purchaseTicketsMutation.mutate(data);
  };

  // Format event date
  const formatEventDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authRequired) {
    return (
      <AuthDialog
        trigger={<></>}
        defaultTab="login"
        onOpenChange={(open) => {
          if (!open) {
            setAuthRequired(false);
          }
        }}
      />
    );
  }

  return (
    <>
      <Button 
        onClick={handleBuyTickets} 
        className={`${className} ${className.includes('w-') ? '' : 'w-full md:w-auto'}`} 
        size={buttonSize}
        variant={buttonVariant}
      >
        {buttonText}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Tickets</DialogTitle>
            <DialogDescription>
              Complete the form below to purchase tickets for {event.title}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Event details card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 opacity-70" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 opacity-70" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="rounded-sm">
                    {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Tickets</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'ticket' : 'tickets'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchPaymentMethod === 'credit' && (
                  <>
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                placeholder="1234 5678 9012 3456" 
                                className="pr-10"
                              />
                              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  placeholder="MM/YY" 
                                  className="pr-10"
                                />
                                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardCVC"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                placeholder="Enter your billing address" 
                                className="pr-10"
                              />
                              <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {watchPaymentMethod !== 'credit' && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              placeholder="your@email.com" 
                              type="email"
                              className="pr-10"
                            />
                            <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {!showStripeForm && (
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={purchaseTicketsMutation.isPending}
                    >
                      {purchaseTicketsMutation.isPending ? 'Processing...' : 'Complete Purchase'}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
            
            {/* Stripe Payment Form */}
            {showStripeForm && (
              <div className="mt-6 space-y-4">
                <div className="text-sm font-medium">
                  Paying with Stripe for {ticketQuantity} {ticketQuantity === 1 ? 'ticket' : 'tickets'}
                </div>
                <StripePaymentForm 
                  amount={ticketQuantity * 3500} // $35.00 per ticket in cents
                  metadata={{
                    eventId: event.id,
                    eventTitle: event.title,
                    quantity: ticketQuantity.toString(),
                    userId: user?.id || ''
                  }}
                  eventId={event.id}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}