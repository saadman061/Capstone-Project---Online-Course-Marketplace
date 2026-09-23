import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import TicketService from '../services/TicketService';
import authMiddleware from '../middleware/auth.middleware';
import { TicketStatus, TicketPriority } from '../entities/Supporting';

const router = Router();

// CREATE a ticket (any authenticated user)
router.post(
  '/',
  authMiddleware,
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('priority').optional().isIn(Object.values(TicketPriority)),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const ticket = await TicketService.createTicket(req.user.userId, req.body);
      res.status(201).json(ticket);
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET tickets raised by the current user
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tickets = await TicketService.getTicketsForUser(req.user.userId);
    res.json(tickets);
  } catch (error: any) {
    console.error('❌ Error fetching tickets:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET the support inbox (support agent / admin only)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user || !['support_agent', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only support agents can view the ticket inbox' });
    }

    const tickets = req.user.role === 'admin'
      ? await TicketService.getAllTickets()
      : await TicketService.getTicketsForAgent(req.user.userId);

    res.json(tickets);
  } catch (error: any) {
    console.error('❌ Error fetching ticket inbox:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// GET a single ticket
router.get('/:ticketId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const ticket = await TicketService.getTicketById(req.params.ticketId, req.user.userId, req.user.role);
    res.json(ticket);
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
});

// UPDATE a ticket - claim it, change status/priority (support agent / admin only)
router.put(
  '/:ticketId',
  authMiddleware,
  [
    body('status').optional().isIn(Object.values(TicketStatus)),
    body('priority').optional().isIn(Object.values(TicketPriority)),
  ],
  async (req: Request, res: Response) => {
    try {
      if (!req.user || !['support_agent', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Only support agents can update tickets' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ticket = await TicketService.updateTicket(req.params.ticketId, req.user.userId, req.body);
      res.json(ticket);
    } catch (error: any) {
      console.error('❌ Error updating ticket:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
