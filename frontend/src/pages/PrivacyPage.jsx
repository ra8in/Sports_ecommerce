import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right"/></svg><span>Privacy Policy</span>
        </div>
      </div>
      
      <div className="container page-head">
        <h1>Privacy Policy.</h1>
        <p className="lede">How we collect, use, and protect your personal information.</p>
      </div>

      <div className="container section" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '32px' }}>Last Updated: August 2026</p>

        <h3 style={{ marginBottom: '16px' }}>1. Information We Collect</h3>
        <p className="pd-desc" style={{ marginTop: 0, marginBottom: '24px' }}>
          When you use SportShop to purchase sporting goods, we collect the necessary information to process your orders and ensure secure delivery. This includes your name, email address, phone number, and physical shipping address in Nepal. If you create an account, we securely store your credentials to streamline future purchases.
        </p>

        <h3 style={{ marginBottom: '16px' }}>2. How We Use Your Data</h3>
        <p className="pd-desc" style={{ marginTop: 0, marginBottom: '24px' }}>
          Your data is strictly used for the fulfillment of orders. We do not sell or rent your personal information to third parties under any circumstances. We may occasionally use your email address to send you updates regarding your order status, or if you opt-in, exclusive offers on new sporting gear.
        </p>

        <h3 style={{ marginBottom: '16px' }}>3. Payment Security</h3>
        <p className="pd-desc" style={{ marginTop: 0, marginBottom: '24px' }}>
          All digital transactions are processed securely through our verified payment partners, eSewa and Khalti. <strong>SportShop does not store your banking details, eSewa credentials, or Khalti MPINs.</strong> Payment routing and verification are handled entirely by the respective payment gateway's secure API.
        </p>

        <h3 style={{ marginBottom: '16px' }}>4. Data Protection</h3>
        <p className="pd-desc" style={{ marginTop: 0, marginBottom: '24px' }}>
          We implement standard security measures, including CSRF tokens and secure session management, to protect your personal information from unauthorized access, alteration, or disclosure.
        </p>

        <h3 style={{ marginBottom: '16px' }}>5. Contact Us</h3>
        <p className="pd-desc" style={{ marginTop: 0, marginBottom: '60px' }}>
          If you have any questions or concerns about this Privacy Policy, please reach out to our team at <a href="mailto:contact@sportshop.com" style={{ color: 'var(--sienna)', textDecoration: 'underline' }}>contact@sportshop.com</a>.
        </p>
      </div>
    </main>
  )
}
