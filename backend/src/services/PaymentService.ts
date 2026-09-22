import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus } from '../entities/Payment';
import { Student } from '../entities/User';

export class PaymentService {
  async initiatePayment(studentId: string, coursePrice: number, method: string) {
    const paymentRepository = getRepository(Payment);
    const studentRepository = getRepository(Student);

    // Verify student exists
    const student = await studentRepository.findOne({ where: { userId: studentId } });
    if (!student) {
      throw new Error('Student not found');
    }

    const payment = new Payment();
    payment.paymentId = uuidv4();
    payment.studentId = studentId;
    payment.amount = coursePrice;
    payment.method = method;
    payment.status = PaymentStatus.PENDING;
    payment.transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await paymentRepository.save(payment);
    console.log('💳 Payment saved to DB:', {
      paymentId: payment.paymentId,
      studentId: payment.studentId,
      amount: payment.amount,
      status: payment.status,
      transactionRef: payment.transactionRef
    });
    return payment;
  }

  async processPayment(paymentId: string) {
    const paymentRepository = getRepository(Payment);

    const payment = await paymentRepository.findOne({ where: { paymentId } });
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment is not in pending state');
    }

    // Simulate payment processing
    // In a real app, this would call Stripe/PayPal/etc
    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();

    await paymentRepository.save(payment);
    console.log('✅ Payment completed in DB:', {
      paymentId: payment.paymentId,
      status: payment.status,
      paidAt: payment.paidAt
    });
    return payment;
  }

  async refundPayment(paymentId: string) {
    const paymentRepository = getRepository(Payment);

    const payment = await paymentRepository.findOne({ where: { paymentId } });
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    payment.status = PaymentStatus.REFUNDED;
    await paymentRepository.save(payment);
    return payment;
  }

  async getPaymentById(paymentId: string) {
    const paymentRepository = getRepository(Payment);
    return await paymentRepository.findOne({ where: { paymentId } });
  }

  async getStudentPayments(studentId: string) {
    const paymentRepository = getRepository(Payment);
    return await paymentRepository.find({ where: { studentId } });
  }
}

export default new PaymentService();