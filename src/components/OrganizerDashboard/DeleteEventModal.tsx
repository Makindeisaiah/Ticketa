import React, { useState, useEffect } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { useEventContext } from '../../context/EventContext';
import { formatOrganizerCurrency } from '../../utils/currency';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  ShieldAlert, 
  Ticket, 
  DollarSign, 
  Users, 
  RefreshCw, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  orders: Order[];
  allTickets: TicketPass[];
  onConfirmDelete: (eventId: string) => Promise<void>;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  isOpen,
  onClose,
  event,
  orders,
  allTickets,
  onConfirmDelete
}) => {
  const { currentOrganizer } = useEventContext();
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const eventOrders = orders.filter(o => o.eventId === event.id);
  const eventTickets = allTickets.filter(t => t.eventId === event.id);
  const totalRevenue = eventOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const buyerCount = eventOrders.length;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(event.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 to-red-600 text-white flex justify-between items-start relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Delete Event</h2>
              <p className="text-xs text-rose-100 font-medium">
                Irreversible event cancellation & purge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Target Event Card Summary */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <img
              src={event.image}
              alt={event.title}
              className="w-14 h-16 rounded-xl object-cover shrink-0 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-slate-900 text-sm truncate">{event.title}</h4>
              <p className="text-xs text-slate-500 font-medium truncate">{event.venueName}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{event.date} • {event.time}</p>
            </div>
          </div>

          {/* Ticket Sales & Refund Impact Box */}
          {buyerCount > 0 ? (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Automatic Refund & Buyer Notification Trigger</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Tickets Sold</span>
                    <span className="text-slate-900 font-mono">{eventTickets.length} pass(es)</span>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Total Refund Value</span>
                    <span className="text-emerald-700 font-mono">{formatOrganizerCurrency(totalRevenue, currentOrganizer)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Deleting this event will automatically trigger full refunds of <strong>{formatOrganizerCurrency(totalRevenue, currentOrganizer)}</strong> to all <strong>{buyerCount} buyer(s)</strong>. Cancellation notifications will be dispatched via email and SMS.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 font-medium">
                No tickets have been sold for this event yet. Deleting it will immediately remove it from the platform with zero pending refunds.
              </p>
            </div>
          )}

          {/* Confirmation Input Guard */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-extrabold text-slate-800">
              To avoid accidental deletion, please type <span className="text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-mono">DELETE</span> below:
            </label>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE here..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl text-sm font-black font-mono tracking-wider text-slate-900 outline-none transition"
            />
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-md ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deleting & Processing Refunds...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Delete Event</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
