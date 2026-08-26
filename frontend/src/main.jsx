import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import './styles/global.css'

import IconSprite from './components/IconSprite'
import Header from './components/Header'
import Footer from './components/Footer'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import EsewaSuccessPage from './pages/EsewaSuccessPage'
import EsewaFailurePage from './pages/EsewaFailurePage'
import KhaltiSuccessPage from './pages/KhaltiSuccessPage'
import KhaltiFailurePage from './pages/KhaltiFailurePage'
import AboutUsPage from './pages/AboutUsPage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import WishlistPage from './pages/WishlistPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <IconSprite />
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/payment/esewa/success" element={<EsewaSuccessPage />} />
              <Route path="/payment/esewa/failure" element={<EsewaFailurePage />} />
              <Route path="/payment/khalti/success" element={<KhaltiSuccessPage />} />
              <Route path="/payment/khalti/failure" element={<KhaltiFailurePage />} />
            </Routes>
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
