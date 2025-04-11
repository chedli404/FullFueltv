import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PayPalProvider } from "@/contexts/PayPalContext";
import { CartDrawer } from "@/components/ui/cart/CartDrawer";

// Pages
import HomePage from "@/pages/HomePage";
import VideosPage from "@/pages/VideosPage";
import EventsPage from "@/pages/EventsPage";
import MusicPage from "@/pages/MusicPage";
import GalleryPage from "@/pages/GalleryPage";
import AboutPage from "@/pages/AboutPage";
import VideoDetailPage from "@/pages/VideoDetailPage";
import EventDetailPage from "@/pages/EventDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/admin/Dashboard";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/videos/:id" component={VideoDetailPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/events/:id" component={EventDetailPage} />
      <Route path="/music" component={MusicPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/profile" component={ProfilePage} />
      {/* Shop routes */}
      <Route path="/shop" component={ShopPage} />
      <Route path="/shop/:id" component={ProductDetailPage} />
      <Route path="/shop/products/:id" component={ProductDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/checkout-success" component={CheckoutSuccessPage} />
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PayPalProvider>
            <Router />
            <CartDrawer />
            <Toaster />
          </PayPalProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
