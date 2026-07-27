import React, { useState } from 'react';
import { EventItem, TicketTier } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Ticket, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Share2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEvent: EventItem) => void;
  editingEvent?: EventItem | null;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEvent
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [category, setCategory] = useState(editingEvent?.category || 'Concerts');
  const [organizerName, setOrganizerName] = useState(editingEvent?.organizerName || 'Event Organizer');
  const [date, setDate] = useState(editingEvent?.date || 'Thu, Dec 25, 2025');
  const [time, setTime] = useState(editingEvent?.time || '19:00 WAT');
  const [venueName, setVenueName] = useState(editingEvent?.venueName || 'Eko Convention Center, VI');
  const [address, setAddress] = useState(editingEvent?.address || 'Victoria Island, Lagos, Nigeria');
  const [image, setImage] = useState(
    editingEvent?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80'
  );
  const [description, setDescription] = useState(
    editingEvent?.description || 'Davido returns to Lagos with a powerful live performance showcasing his greatest hits and new favorites.'
  );

  // Ticket Tiers State
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(
    editingEvent?.ticketTiers || [
      { id: 'tier-1', name: 'Regular', price: 30000, availableQuantity: 1000, soldQuantity: 0, maxPerOrder: 6, description: 'Standard arena admission' },
      { id: 'tier-2', name: 'VIP', price: 100000, availableQuantity: 200, soldQuantity: 0, maxPerOrder: 4, description: 'VIP elevated viewing deck' }
    ]
  );

  // Add tier helper
  const handleAddTier = () => {
    setTicketTiers([
      ...ticketTiers,
      {
        id: `tier-${Date.now()}`,
        name: 'New Tier',
        price: 50000,
        availableQuantity: 500,
        soldQuantity: 0,
        maxPerOrder: 4,
        description: 'Pass access tier'
      }
    ]);
  };

  const handleRemoveTier = (id: string) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers(ticketTiers.filter(t => t.id !== id));
  };

  const handleUpdateTier = (index: number, key: keyof TicketTier, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [key]: value };
    setTicketTiers(updated);
  };

  const handleFinalSubmit = () => {
    const eventObj: EventItem = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title,
      category,
      organizerName,
      date,
      time,
      location: address,
      venueName,
      address,
      image,
      bannerImage: image,
      description,
      featured: true,
      tags: ['Afrobeats', 'Concert', 'Live Music'],
      expectations: ['Live performance', 'Guest artists', 'Stage lighting'],
      refundPolicy: 'Non-refundable except event cancellation.',
      importantInfo: ['Gates open 5:00 PM', 'E-tickets required'],
      ticketTiers
    };

    onSubmit(eventObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-[#00C896] uppercase tracking-wider block">
              Step {step} of 5
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {editingEvent ? 'Edit Event Details' : 'Create New Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Stepper Indicator */}
        <div className="grid grid-cols-5 border-b border-slate-100 text-[11px] font-bold text-center bg-white">
          {[
            '1. Details',
            '2. Tickets',
            '3. Fees & Refund',
            '4. Advanced',
            '5. Publish'
          ].map((st, i) => (
            <div
              key={i}
              className={`py-2.5 transition border-b-2 ${
                step === i + 1
                  ? 'border-[#00C896] text-[#00C896] bg-emerald-50/50'
                  : step > i + 1
                  ? 'border-emerald-300 text-emerald-800'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {st}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5 text-xs font-semibold">
          
          {/* STEP 1: EVENT DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Davido Live in Lagos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  >
                    <option value="Concerts">Concerts</option>
                    <option value="Festivals">Festivals</option>
                    <option value="Nightlife">Nightlife</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Organizer Name</label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={e => setOrganizerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Event Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="Thu, Dec 25, 2025"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="19:00 WAT"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    placeholder="Eko Convention Center, VI"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Victoria Island, Lagos"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-normal outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TICKET TYPES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Configure Ticket Tiers</h3>
                <button
                  onClick={handleAddTier}
                  className="px-3 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tier</span>
                </button>
              </div>

              <div className="space-y-3">
                {ticketTiers.map((tier, idx) => (
                  <div key={tier.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">Tier #{idx + 1}</span>
                      {ticketTiers.length > 1 && (
                        <button
                          onClick={() => handleRemoveTier(tier.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={e => handleUpdateTier(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Price (₦)</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={e => handleUpdateTier(idx, 'price', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Quantity</label>
                        <input
                          type="number"
                          value={tier.availableQuantity}
                          onChange={e => handleUpdateTier(idx, 'availableQuantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: FEES & REFUND */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Payment & Refund Policy</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="radio" name="feePolicy" defaultChecked />
                  <span>Pass Platform Service Fee to Attendee (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="radio" name="feePolicy" />
                  <span>Absorb Service Fees in Ticket Price</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Refund Terms</label>
                <textarea
                  rows={3}
                  defaultValue="Tickets are non-refundable except in the case of official event cancellation."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-normal outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: ADVANCED */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Advanced Event Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                  <span>Public Listing on Ticket Platform</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                  <span>Require Age Verification (18+)</span>
                  <input type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: PUBLISH */}
          {step === 5 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00C896] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Ready to Publish Event?</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your event <span className="font-extrabold text-slate-900">"{title}"</span> is configured with {ticketTiers.length} ticket tiers and ready for live sales.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div></div>}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-5 py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-[#00C896] hover:bg-[#00b386] text-white font-black rounded-xl text-xs shadow-xl shadow-[#00C896]/30"
            >
              Publish Event Now
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
