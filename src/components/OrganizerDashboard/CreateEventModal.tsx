import React, { useState, useEffect, useRef } from 'react';
import { EventItem, TicketTier } from '../../types';
import { useLanguage } from '../../utils/translations';
import { useEventContext } from '../../context/EventContext';
import { getOrganizerCurrencyConfig } from '../../utils/currency';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEvent: EventItem) => void;
  editingEvent?: EventItem | null;
}

const formatIsoDate = (dStr: string) => {
  if (!dStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
  const parsed = new Date(dStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return '';
};

const formatIsoTime = (tStr: string) => {
  if (!tStr) return '';
  const match = tStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }
  return '';
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEvent
}) => {
  const { t, lang } = useLanguage();
  const { currentOrganizer } = useEventContext();
  const orgCurrConfig = getOrganizerCurrencyConfig(currentOrganizer);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Concerts');
  const [organizerName, setOrganizerName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ticket Tiers State
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setCategory(editingEvent.category || 'Concerts');
        setOrganizerName(editingEvent.organizerName || '');
        setDate(formatIsoDate(editingEvent.date || ''));
        setTime(formatIsoTime(editingEvent.time || ''));
        setVenueName(editingEvent.venueName || '');
        setAddress(editingEvent.address || editingEvent.location || '');
        setImage(editingEvent.image || '');
        setDescription(editingEvent.description || '');
        setTicketTiers(
          editingEvent.ticketTiers && editingEvent.ticketTiers.length > 0
            ? editingEvent.ticketTiers
            : [
                { id: 'tier-1', name: 'Regular', price: 10000, availableQuantity: 500, soldQuantity: 0, maxPerOrder: 6, description: 'General Admission' },
                { id: 'tier-2', name: 'VIP', price: 50000, availableQuantity: 100, soldQuantity: 0, maxPerOrder: 4, description: 'VIP Area Access' }
              ]
        );
      } else {
        setTitle('');
        setCategory('Concerts');
        setOrganizerName('');
        setDate('');
        setTime('');
        setVenueName('');
        setAddress('');
        setImage('');
        setDescription('');
        setTicketTiers([
          { id: 'tier-1', name: 'Regular', price: 10000, availableQuantity: 500, soldQuantity: 0, maxPerOrder: 6, description: 'General Admission' },
          { id: 'tier-2', name: 'VIP', price: 50000, availableQuantity: 100, soldQuantity: 0, maxPerOrder: 4, description: 'VIP Area Access' }
        ]);
      }
    }
  }, [isOpen, editingEvent]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Add tier helper
  const handleAddTier = () => {
    setTicketTiers([
      ...ticketTiers,
      {
        id: `tier-${Date.now()}`,
        name: 'New Tier',
        price: 25000,
        availableQuantity: 200,
        soldQuantity: 0,
        maxPerOrder: 4,
        description: 'Ticket access tier'
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
    const defaultPlaceholderImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';
    const finalImage = image || defaultPlaceholderImage;

    const orgCurrConfig = getOrganizerCurrencyConfig(currentOrganizer);
    const defaultCountry = currentOrganizer?.payoutAccount?.country || currentOrganizer?.country || 'Nigeria';

    const eventObj: EventItem = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: title || 'Untitled Event',
      category: category || 'Concerts',
      organizerName: organizerName || currentOrganizer?.organizationName || 'Event Organizer',
      organizerId: currentOrganizer?.id || '',
      currency: orgCurrConfig.code,
      country: defaultCountry,
      date: date || 'Dec 25, 2026',
      time: time || '19:00 GMT',
      location: address || venueName || defaultCountry,
      venueName: venueName || 'Main Arena',
      address: address || venueName || defaultCountry,
      image: finalImage,
      bannerImage: finalImage,
      description: description || 'Experience an unforgettable event live with us.',
      featured: true,
      tags: ['Live Event', category],
      expectations: ['Live performance', 'High energy atmosphere', 'E-tickets scanning'],
      refundPolicy: 'Non-refundable except event cancellation.',
      importantInfo: ['Gates open 2 hours prior', 'E-tickets required for entry'],
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
              {t('stepOfFive').replace('{step}', String(step))}
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {editingEvent ? t('editEventDetails') : t('createNewEvent')}
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
            t('step1Details'),
            t('step2Tickets'),
            t('step3FeesRefund'),
            t('step4Advanced'),
            t('step5Publish')
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
                <label className="block text-slate-700 font-bold mb-1">{t('eventTitleLabel')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('eventTitlePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('categoryLabel')}</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  >
                    <option value="Concerts">{t('catConcerts')}</option>
                    <option value="Comedy">{t('catComedy')}</option>
                    <option value="Tech">{t('catTech')}</option>
                    <option value="Festival">{t('catFestival')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('organizerNameLabel')}</label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={e => setOrganizerName(e.target.value)}
                    placeholder={t('organizerNamePlaceholder')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('eventDateLabel')}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('timeLabel')}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('venueNameLabel')}</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    placeholder={t('venueNamePlaceholder')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('fullAddressLabel')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={t('fullAddressPlaceholder')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Upload from Device */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>{t('coverImageLabel')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t('uploadPhotoFromDevice')}</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900/5">
                    <img
                      src={image}
                      alt="Cover Preview"
                      className="w-full h-44 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-900 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#00C896]" />
                        <span>{t('changePhoto')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('removePhoto')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#00C896] bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00C896] group-hover:scale-105 transition flex items-center justify-center shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">
                        {isUploading ? t('processingImage') : t('clickToSelectImage')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t('supportedImageFormats')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('descriptionLabel')}</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 font-normal outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TICKET TYPES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">{t('configureTicketTiers')}</h3>
                <button
                  onClick={handleAddTier}
                  className="px-3 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addTier')}</span>
                </button>
              </div>

              <div className="space-y-3">
                {ticketTiers.map((tier, idx) => (
                  <div key={tier.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">{t('tierNumber').replace('{number}', String(idx + 1))}</span>
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
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">{t('tierNameLabel')}</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={e => handleUpdateTier(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">{lang === 'fr' ? `Prix (${orgCurrConfig.code})` : `Price (${orgCurrConfig.code})`}</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={e => handleUpdateTier(idx, 'price', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">{t('quantityLabel')}</label>
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
              <h3 className="text-sm font-extrabold text-slate-900">{t('paymentRefundPolicy')}</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="radio" name="feePolicy" defaultChecked />
                  <span>{t('passPlatformFee')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="radio" name="feePolicy" />
                  <span>{t('absorbPlatformFee')}</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('refundTermsLabel')}</label>
                <textarea
                  rows={3}
                  defaultValue={t('refundTermsDefault')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-normal outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: ADVANCED */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">{t('advancedSettingsHeader')}</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                  <span>{t('publicListingOption')}</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                  <span>{t('ageVerificationOption')}</span>
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
              <h3 className="text-lg font-black text-slate-900">{t('readyToPublish')}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('eventReadyNotice').replace('{title}', title || 'Untitled').replace('{count}', String(ticketTiers.length))}
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
              <span>{t('previousStep')}</span>
            </button>
          ) : <div></div>}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-5 py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              <span>{t('nextStep')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-[#00C896] hover:bg-[#00b386] text-white font-black rounded-xl text-xs shadow-xl shadow-[#00C896]/30"
            >
              {t('publishEventNow')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
