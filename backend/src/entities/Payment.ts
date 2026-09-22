import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './User';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId: string;

  @Column('char', { length: 36, name: 'student_id' })
  studentId: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'amount' })
  amount: number;

  @Column('varchar', { length: 50, name: 'method' })
  method: string; // 'credit_card', 'paypal', etc.

  @Column('varchar', { length: 20, name: 'status', default: 'pending' })
  status: PaymentStatus;

  @Column('varchar', { length: 255, name: 'transaction_ref', nullable: true })
  transactionRef: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('datetime', { nullable: true, name: 'paid_at' })
  paidAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  processPayment(): boolean {
    // Payment processing logic
    return true;
  }

  refund(): boolean {
    // Refund logic
    this.status = PaymentStatus.REFUNDED;
    return true;
  }
}