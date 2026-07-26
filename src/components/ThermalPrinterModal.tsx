import React, { useState } from 'react';
import { TicketPass } from '../types';
import { printThermalWristband } from '../utils/ticketExporter';
import { 
  Printer, X, QrCode, Shield, CheckCircle2, RefreshCw, 
  Settings, Zap, Sparkles, Cpu, Wifi, Usb, Layers, Eye
} from 'lucide-react';

interface ThermalPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket?: TicketPass;
  autoPrintEnabled?: boolean;
  onToggleAutoPrint?: (enabled: boolean) => void;
  gateName?: string;
}

export const ThermalPrinterModal: React.FC<ThermalPrinterModalProps> = ({
  isOpen,
  onClose,
  selectedTicket,
  autoPrintEnabled = false,
  onToggleAutoPrint,
  gateName = 'Gate #1 Main Entrance'
}) => {
  const [printFormat, setPrintFormat] = useState<'WRISTBAND_1X11' | 'BADGE_3X4' | 'RECEIPT_80MM'>('WRISTBAND_1X11');
  const [printerDevice, setPrinterDevice] = useState<'ZEBRA_ZD510' | 'EPSON_TM88' | 'STAR_MICRONICS' | 'BLUETOOTH_GENERIC'>('ZEBRA_ZD510');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCount, setPrintCount] = useState(1);

  if (!isOpen) return null;

  // Mock sample ticket if none passed
  const activeTicket: TicketPass = selectedTicket || {
    ticketCode: 'TKT-9042-VIP',
    eventTitle: 'Davido Live at Crystal Palace Arena',
    tierName: 'VVIP GOLD',
    attendeeName: 'Olawale Adenike',
    attendeeEmail: 'adenike@example.com',
    attendeePhone: '+234 812 990 1122',
    venueName: 'Crystal Palace Arena',
    eventDate: '2026-08-15',
    eventTime: '19:00 GMT',
    orderId: 'ORD-88219',
    status: 'CHECKED_IN',
    checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    scannedByGate: gateName
  };

  const handleExecutePrint = () => {
    setIsPrinting(true);
    for (let i = 0; i < printCount; i++) {
      printThermalWristband(activeTicket, { format: printFormat, gateName });
    }
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Thermal Wristband & Badge Printer</h2>
              <p className="text-xs text-slate-400">
                Trigger high-contrast ESC/POS & Zebra ZD510 thermal prints for gate check-in passes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-none flex-1">
          
          {/* Printer & Auto-Print Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Media Print Format */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Print Media Format</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPrintFormat('WRISTBAND_1X11')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    printFormat === 'WRISTBAND_1X11'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">1" x 11" Event Wristband</div>
                      <div className="text-[10px] text-slate-500">Zebra ZD510-HC / Continuous Adhesive</div>
                    </div>
                  </div>
                  {printFormat === 'WRISTBAND_1X11' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPrintFormat('BADGE_3X4')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    printFormat === 'BADGE_3X4'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white">3" x 4" Lanyard Venue Badge</div>
                      <div className="text-[10px] text-slate-500">Direct Thermal Cardstock Pass</div>
                    </div>
                  </div>
                  {printFormat === 'BADGE_3X4' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPrintFormat('RECEIPT_80MM')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    printFormat === 'RECEIPT_80MM'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">80mm Thermal Receipt Pass</div>
                      <div className="text-[10px] text-slate-500">Epson / Star Micronics Roll</div>
                    </div>
                  </div>
                  {printFormat === 'RECEIPT_80MM' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Hardware Hardware Device Driver */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Connected Thermal Driver</label>
                <select
                  value={printerDevice}
                  onChange={e => setPrinterDevice(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ZEBRA_ZD510">Zebra ZD510-HC Direct Thermal (USB/LAN)</option>
                  <option value="EPSON_TM88">Epson TM-T88VI ESC/POS (USB/LAN)</option>
                  <option value="STAR_MICRONICS">Star Micronics TSP100 / mPOP (Bluetooth)</option>
                  <option value="BLUETOOTH_GENERIC">Generic Bluetooth Portable Wristband Printer</option>
                </select>
              </div>

              {/* Auto-Print Gate Switcher */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Auto-Print on Valid Check-in</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onToggleAutoPrint && onToggleAutoPrint(!autoPrintEnabled)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      autoPrintEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  When enabled, gate scanners automatically trigger wristband print feeds the instant a valid pass code is scanned.
                </p>
              </div>

              {/* Print Copies */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Copies per Trigger</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPrintCount(count)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        printCount === count
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {count} {count === 1 ? 'Copy' : 'Copies'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Live Thermal Wristband / Badge Visual Preview Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live Thermal Output Preview</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400">STATUS: READY TO FEED</span>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-center items-center overflow-x-auto min-h-[140px]">
              
              {printFormat === 'WRISTBAND_1X11' ? (
                /* 1" x 11" Wristband Horizontal Render */
                <div className="w-[580px] h-[80px] bg-white text-black rounded-lg p-3 border-2 border-black flex items-center justify-between gap-3 shrink-0 shadow-lg font-sans">
                  <div className="border-r-2 border-dashed border-black pr-3 text-[9px] font-black text-center w-16 leading-tight bg-slate-100 p-1 rounded">
                    <div>SECURITY</div>
                    <div>VOID IF</div>
                    <div>REMOVED</div>
                  </div>

                  <div className="p-1 bg-black text-white font-mono font-black text-xs rounded border border-black flex items-center justify-center w-12 h-12">
                    <QrCode className="w-10 h-10" />
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest text-slate-700">TICKETA GATE WRISTBAND</span>
                      <span className="bg-black text-white text-[11px] font-black px-2 py-0.5 rounded uppercase">
                        {activeTicket.tierName}
                      </span>
                    </div>
                    <div className="text-base font-black uppercase text-black leading-tight">
                      {activeTicket.attendeeName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-800 truncate">
                      {activeTicket.eventTitle} • {activeTicket.venueName}
                    </div>
                  </div>

                  <div className="border-l-2 border-black pl-3 text-right space-y-0.5 font-mono text-[10px]">
                    <div className="font-black text-xs text-black">{activeTicket.ticketCode}</div>
                    <div className="text-slate-700">{gateName}</div>
                    <div className="text-slate-500">2026-07-26 10:45</div>
                  </div>
                </div>
              ) : printFormat === 'BADGE_3X4' ? (
                /* 3" x 4" Lanyard Badge Render */
                <div className="w-[240px] bg-white text-black rounded-xl p-4 border-2 border-black text-center shadow-lg font-sans space-y-3">
                  <div className="border-b-2 border-black pb-2">
                    <div className="text-[10px] font-black tracking-widest">TICKETA OFFICIAL PASS</div>
                    <div className="text-xs font-black uppercase mt-1">{activeTicket.eventTitle}</div>
                  </div>

                  <div className="py-2">
                    <span className="bg-black text-white text-sm font-black px-3 py-1 rounded-md uppercase">
                      {activeTicket.tierName} ACCESS
                    </span>
                    <div className="text-lg font-black uppercase mt-2 leading-tight">{activeTicket.attendeeName}</div>
                    <div className="text-[11px] font-bold text-slate-700">{activeTicket.venueName}</div>
                  </div>

                  <div className="border-t-2 border-b-2 border-dashed border-black py-2 flex items-center justify-center space-x-2">
                    <QrCode className="w-12 h-12 text-black" />
                    <div className="text-left font-mono text-[10px] space-y-0.5">
                      <div className="font-bold">{activeTicket.ticketCode}</div>
                      <div>{gateName}</div>
                      <div>ORD: {activeTicket.orderId}</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 80mm Roll Thermal Receipt Render */
                <div className="w-[220px] bg-white text-black rounded-lg p-3 border-2 border-black text-center shadow-lg font-mono text-xs space-y-2">
                  <div className="font-black border-b border-black pb-1">TICKETA GATE RECEIPT</div>
                  <div className="font-bold uppercase text-[11px]">{activeTicket.eventTitle}</div>
                  <div className="bg-black text-white font-sans text-xs font-black py-1 rounded">
                    {activeTicket.tierName}
                  </div>
                  <div className="font-sans font-black text-base uppercase">{activeTicket.attendeeName}</div>
                  <div className="py-1 border-t border-b border-black border-dashed flex justify-center">
                    <QrCode className="w-16 h-16 text-black" />
                  </div>
                  <div className="font-black text-sm">{activeTicket.ticketCode}</div>
                  <div className="text-[9px] text-slate-600">{gateName} • PRINTED LIVE</div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Driver: <strong className="text-slate-200">{printerDevice.replace('_', ' ')}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleExecutePrint}
              disabled={isPrinting}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className={`w-4 h-4 ${isPrinting ? 'animate-bounce' : ''}`} />
              <span>{isPrinting ? 'Feeding Thermal Media...' : 'Trigger Thermal Print'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
