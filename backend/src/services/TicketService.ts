import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus, TicketPriority } from '../entities/Supporting';
import { SupportAgent } from '../entities/User';
import NotificationService from './NotificationService';

export class TicketService {
  async createTicket(raisedByUserId: string, data: {
    subject: string;
    description: string;
    priority?: TicketPriority;
  }) {
    const ticketRepository = getRepository(Ticket);
    const agentRepository = getRepository(SupportAgent);

    const ticket = new Ticket();
    ticket.ticketId = uuidv4();
    ticket.raisedByUserId = raisedByUserId;
    ticket.subject = data.subject;
    ticket.description = data.description;
    ticket.priority = data.priority || TicketPriority.MEDIUM;
    ticket.status = TicketStatus.OPEN;

    // Auto-assign to whichever support agent currently has the fewest open/in-progress tickets
    const agents = await agentRepository.find();
    if (agents.length > 0) {
      const withLoad = await Promise.all(
        agents.map(async (agent) => ({
          agent,
          count: await ticketRepository.count({
            where: [
              { assignedAgentId: agent.userId, status: TicketStatus.OPEN },
              { assignedAgentId: agent.userId, status: TicketStatus.IN_PROGRESS },
            ],
          }),
        }))
      );
      withLoad.sort((a, b) => a.count - b.count);
      ticket.assignedAgentId = withLoad[0].agent.userId;
    }

    await ticketRepository.save(ticket);

    if (ticket.assignedAgentId) {
      await NotificationService.createNotification(
        ticket.assignedAgentId,
        `New support ticket assigned to you: "${ticket.subject}"`
      );
    }

    return ticket;
  }

  async getTicketsForUser(userId: string) {
    const ticketRepository = getRepository(Ticket);

    return await ticketRepository.find({
      where: { raisedByUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTicketsForAgent(agentId: string) {
    const ticketRepository = getRepository(Ticket);

    // Show tickets already assigned to this agent, plus unassigned tickets they could claim
    return await ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.raisedByUser', 'raisedByUser')
      .where('ticket.assignedAgentId = :agentId', { agentId })
      .orWhere('ticket.assignedAgentId IS NULL')
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async getAllTickets() {
    const ticketRepository = getRepository(Ticket);

    return await ticketRepository.find({
      relations: ['raisedByUser', 'assignedAgent'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTicketById(ticketId: string, requesterId: string, requesterRole: string) {
    const ticketRepository = getRepository(Ticket);

    const ticket = await ticketRepository.findOne({
      where: { ticketId },
      relations: ['raisedByUser', 'assignedAgent'],
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const isOwner = ticket.raisedByUserId === requesterId;
    const isAgent = requesterRole === 'support_agent' || requesterRole === 'admin';

    if (!isOwner && !isAgent) {
      throw new Error('Unauthorized');
    }

    return ticket;
  }

  async updateTicket(ticketId: string, agentId: string, data: {
    status?: TicketStatus;
    priority?: TicketPriority;
    claim?: boolean;
  }) {
    const ticketRepository = getRepository(Ticket);

    const ticket = await ticketRepository.findOne({ where: { ticketId } });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (data.claim) {
      ticket.assignedAgentId = agentId;
    }

    if (data.status) {
      ticket.status = data.status;
    }

    if (data.priority) {
      ticket.priority = data.priority;
    }

    await ticketRepository.save(ticket);
    return ticket;
  }
}

export default new TicketService();
