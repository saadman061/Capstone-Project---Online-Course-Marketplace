import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Certificate } from '../entities/Supporting';
import { Enrollment } from '../entities/Enrollment';
import { Course } from '../entities/Course';
import { Student } from '../entities/User';

export class CertificateService {
  /**
   * Generate a certificate for completed course
   * Returns a certificate object with URL (for now, a data URI with SVG)
   */
  async generateCertificate(enrollmentId: string) {
    const certificateRepository = getRepository(Certificate);
    const enrollmentRepository = getRepository(Enrollment);

    // Check if certificate already exists
    const existingCert = await certificateRepository.findOne({
      where: { enrollmentId },
    });

    if (existingCert) {
      return existingCert;
    }

    // Verify enrollment exists and is completed
    const enrollment = await enrollmentRepository.findOne({
      where: { enrollmentId },
      relations: ['student', 'course'],
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (!enrollment.completed) {
      throw new Error('Course must be completed before generating certificate');
    }

    // Create SVG certificate (base64 encoded)
    const student = enrollment.student as any;
    const course = enrollment.course as any;
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const certificateId = uuidv4();
    const svgContent = this.generateCertificateSVG(
      student.name,
      course.title,
      completionDate,
      certificateId
    );

    // Convert SVG to base64 data URI
    const base64SVG = Buffer.from(svgContent).toString('base64');
    const fileUrl = `data:image/svg+xml;base64,${base64SVG}`;

    // Save certificate record
    const certificate = new Certificate();
    certificate.certificateId = certificateId;
    certificate.enrollmentId = enrollmentId;
    certificate.fileUrl = fileUrl;

    await certificateRepository.save(certificate);
    return certificate;
  }

  /**
   * Generate SVG certificate content
   */
  private generateCertificateSVG(
    studentName: string,
    courseName: string,
    completionDate: string,
    certificateId: string
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700">
  <!-- Background -->
  <rect width="1000" height="700" fill="#f8f4e6"/>
  
  <!-- Border -->
  <rect x="40" y="40" width="920" height="620" fill="none" stroke="#8b6f47" stroke-width="3"/>
  <rect x="50" y="50" width="900" height="600" fill="none" stroke="#c9a961" stroke-width="1"/>
  
  <!-- Decorative corners -->
  <g stroke="#8b6f47" stroke-width="2" fill="none">
    <path d="M 70 70 L 120 70 L 120 120"/>
    <path d="M 930 70 L 880 70 L 880 120"/>
    <path d="M 70 630 L 70 580 L 120 580"/>
    <path d="M 930 630 L 930 580 L 880 580"/>
  </g>
  
  <!-- Title -->
  <text x="500" y="120" font-size="48" font-weight="bold" text-anchor="middle" fill="#8b6f47" font-family="Georgia, serif">
    Certificate of Completion
  </text>
  
  <!-- Decorative line -->
  <line x1="300" y1="150" x2="700" y2="150" stroke="#c9a961" stroke-width="2"/>
  
  <!-- "This is to certify that" text -->
  <text x="500" y="220" font-size="18" text-anchor="middle" fill="#333" font-family="Georgia, serif">
    This is to certify that
  </text>
  
  <!-- Student name -->
  <text x="500" y="280" font-size="32" font-weight="bold" text-anchor="middle" fill="#000" font-family="Georgia, serif" letter-spacing="2">
    ${studentName}
  </text>
  <line x1="250" y1="295" x2="750" y2="295" stroke="#8b6f47" stroke-width="2"/>
  
  <!-- Achievement text -->
  <text x="500" y="360" font-size="16" text-anchor="middle" fill="#333" font-family="Georgia, serif">
    has successfully completed the course
  </text>
  
  <!-- Course name -->
  <text x="500" y="410" font-size="24" font-weight="bold" text-anchor="middle" fill="#000" font-family="Georgia, serif">
    ${courseName}
  </text>
  <line x1="150" y1="430" x2="850" y2="430" stroke="#c9a961" stroke-width="1" stroke-dasharray="5,5"/>
  
  <!-- Completion date -->
  <text x="500" y="490" font-size="14" text-anchor="middle" fill="#555" font-family="Georgia, serif">
    Completed on ${completionDate}
  </text>
  
  <!-- Certificate ID -->
  <text x="500" y="620" font-size="10" text-anchor="middle" fill="#999" font-family="monospace">
    Certificate ID: ${certificateId}
  </text>
  
  <!-- Seal/Badge -->
  <circle cx="150" cy="550" r="40" fill="#8b6f47" opacity="0.1"/>
  <circle cx="150" cy="550" r="40" fill="none" stroke="#8b6f47" stroke-width="2"/>
  <text x="150" y="560" font-size="24" text-anchor="middle" fill="#8b6f47" font-family="Arial">✓</text>
</svg>`;
  }

  /**
   * Get certificate for an enrollment
   */
  async getCertificate(enrollmentId: string) {
    const certificateRepository = getRepository(Certificate);

    const certificate = await certificateRepository.findOne({
      where: { enrollmentId },
      relations: ['enrollment'],
    });

    if (!certificate) {
      throw new Error('Certificate not found for this enrollment');
    }

    return certificate;
  }

  /**
   * Get all certificates for a student
   */
  async getStudentCertificates(studentId: string) {
    const certificateRepository = getRepository(Certificate);

    const certificates = await certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.enrollment', 'enrollment')
      .where('enrollment.studentId = :studentId', { studentId })
      .getMany();

    return certificates;
  }

  /**
   * Delete certificate (admin only)
   */
  async deleteCertificate(certificateId: string) {
    const certificateRepository = getRepository(Certificate);

    const certificate = await certificateRepository.findOne({
      where: { certificateId },
    });

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    await certificateRepository.remove(certificate);
    return { success: true };
  }
}

export default new CertificateService();