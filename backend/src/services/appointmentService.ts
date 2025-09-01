import prisma from '../utils/prisma';
import { TimeSlot } from '../types/database';

export class AppointmentService {
  // Create a new appointment request
  async createAppointment(menteeId: string, mentorId: string, datetime: Date) {
    // Verify mentor exists and has availability
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId, role: 'MENTOR' }
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    // Check if mentor has availability for the requested time
    const isAvailable = await this.checkMentorAvailability(mentorId, datetime);
    if (!isAvailable) {
      throw new Error('Mentor is not available at the requested time');
    }

    // Check for existing appointments at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        mentorId,
        datetime,
        status: {
          in: ['REQUESTED', 'ACCEPTED']
        }
      }
    });

    if (existingAppointment) {
      throw new Error('Time slot is already booked');
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        menteeId,
        mentorId,
        datetime,
        status: 'REQUESTED'
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });

    return appointment;
  }

  // Get appointments for a user (mentor or mentee)
  async getUserAppointments(userId: string, role: string) {
    const whereClause = role === 'MENTOR' 
      ? { mentorId: userId }
      : { menteeId: userId };

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      },
      orderBy: {
        datetime: 'asc'
      }
    });

    return appointments;
  }

  // Accept an appointment (mentor only)
  async acceptAppointment(appointmentId: string, mentorId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        mentor: true,
        mentee: true
      }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.mentorId !== mentorId) {
      throw new Error('Unauthorized: You can only accept your own appointments');
    }

    if (appointment.status !== 'REQUESTED') {
      throw new Error('Appointment cannot be accepted in its current status');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'ACCEPTED' },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });

    return updatedAppointment;
  }

  // Reject an appointment (mentor only)
  async rejectAppointment(appointmentId: string, mentorId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.mentorId !== mentorId) {
      throw new Error('Unauthorized: You can only reject your own appointments');
    }

    if (appointment.status !== 'REQUESTED') {
      throw new Error('Appointment cannot be rejected in its current status');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });

    return updatedAppointment;
  }

  // Complete an appointment (mentor or mentee)
  async completeAppointment(appointmentId: string, userId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.mentorId !== userId && appointment.menteeId !== userId) {
      throw new Error('Unauthorized: You can only complete your own appointments');
    }

    if (appointment.status !== 'ACCEPTED') {
      throw new Error('Appointment must be accepted before it can be completed');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });

    return updatedAppointment;
  }

  // Cancel an appointment (mentor or mentee)
  async cancelAppointment(appointmentId: string, userId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.mentorId !== userId && appointment.menteeId !== userId) {
      throw new Error('Unauthorized: You can only cancel your own appointments');
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new Error('Appointment cannot be cancelled in its current status');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });

    return updatedAppointment;
  }

  // Check if mentor is available at a specific time
  private async checkMentorAvailability(mentorId: string, datetime: Date): Promise<boolean> {
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId }
    });

    if (!mentor || !mentor.availabilitySlots) {
      return false;
    }

    try {
      const availabilitySlots: TimeSlot[] = JSON.parse(mentor.availabilitySlots);
      const requestedDay = datetime.toLocaleDateString('en-US', { weekday: 'long' });
      const requestedTime = datetime.toTimeString().slice(0, 5); // HH:MM format

      // Check if the requested time falls within any availability slot
      return availabilitySlots.some(slot => {
        return slot.day === requestedDay && 
               requestedTime >= slot.startTime && 
               requestedTime <= slot.endTime;
      });
    } catch (error) {
      console.error('Error parsing availability slots:', error);
      return false;
    }
  }

  // Get mentor's available time slots (excluding booked appointments)
  async getMentorAvailableSlots(mentorId: string) {
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId, role: 'MENTOR' }
    });

    if (!mentor || !mentor.availabilitySlots) {
      return [];
    }

    try {
      const availabilitySlots: TimeSlot[] = JSON.parse(mentor.availabilitySlots);
      
      // Get all accepted/requested appointments for this mentor
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          mentorId,
          status: {
            in: ['REQUESTED', 'ACCEPTED']
          }
        },
        select: {
          datetime: true
        }
      });

      // Convert booked appointments to a set of datetime strings for quick lookup
      const bookedTimes = new Set(
        bookedAppointments.map((apt: { datetime: Date }) => apt.datetime.toISOString())
      );

      return {
        availabilitySlots,
        bookedTimes: Array.from(bookedTimes)
      };
    } catch (error) {
      console.error('Error parsing availability slots:', error);
      return [];
    }
  }
}

export const appointmentService = new AppointmentService();