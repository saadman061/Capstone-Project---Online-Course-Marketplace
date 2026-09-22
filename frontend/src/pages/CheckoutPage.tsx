import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState, cartActions } from '../redux/store';
import { enrollmentAPI } from '../api/client';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [step, setStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</p>
          <p className="text-gray-600 mb-6">Browse our courses and add some to your cart</p>
          <a
            href="/courses"
            className="inline-block px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const handleRemoveFromCart = (courseId: string) => {
    dispatch(cartActions.removeFromCart(courseId));
  };

  const handlePayment = async () => {
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);
    setEnrollmentError(null);
    try {
      // Simulate payment processing (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('💳 Processing enrollments for', cartItems.length, 'courses');

      // Enroll in each course
      for (const course of cartItems) {
        try {
          const response = await enrollmentAPI.enroll({
            courseId: course.courseId,
            coursePrice: course.price,
            paymentMethod: 'card'
          });
          console.log('✅ Enrolled in course:', course.title, response.data);
        } catch (enrollError: any) {
          console.error('❌ Enrollment failed for', course.title, enrollError);
          setEnrollmentError(enrollError.response?.data?.error || `Failed to enroll in ${course.title}`);
          setLoading(false);
          return;
        }
      }

      // If all enrollments successful, show confirmation
      setStep('confirmation');
    } catch (error: any) {
      console.error('Payment error:', error);
      setEnrollmentError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = () => {
    dispatch(cartActions.clearCart());
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-12">Checkout</h1>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Step Indicator */}
            <div className="flex gap-4 mb-8">
              <div className={`flex-1 p-4 rounded-lg font-bold text-center ${step === 'review' ? 'bg-secondary text-white' : 'bg-white'}`}>
                1. Review Cart
              </div>
              <div className={`flex-1 p-4 rounded-lg font-bold text-center ${step === 'payment' ? 'bg-secondary text-white' : 'bg-white'}`}>
                2. Payment
              </div>
              <div className={`flex-1 p-4 rounded-lg font-bold text-center ${step === 'confirmation' ? 'bg-secondary text-white' : 'bg-white'}`}>
                3. Confirmation
              </div>
            </div>

            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary mb-6">Review Your Cart</h2>

                {cartItems.map((item) => (
                  <div key={item.courseId} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-primary">{item.title}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.courseId)}
                      className="px-4 py-2 text-danger font-bold hover:opacity-70"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setStep('payment')}
                  className="w-full px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition mt-8"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Payment Information</h2>

                {enrollmentError && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="font-semibold">Error</p>
                    <p>{enrollmentError}</p>
                  </div>
                )}

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/25"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep('review')}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Complete Payment'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Confirmation Step */}
            {step === 'confirmation' && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-6xl mb-4">✅</p>
                <h2 className="text-3xl font-bold text-accent mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                  You have been enrolled in {cartItems.length} {cartItems.length === 1 ? 'course' : 'courses'}.
                  Start learning today!
                </p>

                <button
                  onClick={handleConfirmation}
                  className="px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
                >
                  Go to My Courses
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h3 className="text-xl font-bold text-primary mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'course' : 'courses'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Tax (0%)</span>
              <span className="font-bold">$0.00</span>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-secondary">${cartTotal.toFixed(2)}</span>
            </div>

            <div className="mt-6 p-4 bg-blue-100 rounded-lg text-sm text-blue-800">
              💳 This is a demo checkout. No real payment is processed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;