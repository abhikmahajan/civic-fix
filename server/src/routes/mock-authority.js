import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const tickets = new Map();

router.post('/:department/tickets', (req, res) => {
  const { department } = req.params;
  const ticketId = `${department.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const ticket = {
    ticket_id: ticketId,
    department,
    status: 'assigned',
    created_at: new Date().toISOString(),
    ...req.body
  };
  
  tickets.set(ticketId, ticket);
  res.status(201).json(ticket);
});

router.get('/:department/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const ticket = tickets.get(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

router.patch('/:department/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const ticket = tickets.get(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  
  const updatedTicket = { ...ticket, ...req.body };
  tickets.set(ticketId, updatedTicket);
  res.json(updatedTicket);
});

export default router;
