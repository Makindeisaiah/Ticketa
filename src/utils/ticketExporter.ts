import { TicketPass } from '../types';

/**
 * Exports a ticket pass as a printable PDF / HTML document with QR code and event pass formatting.
 */
export const exportTicketAsPdf = (ticket: TicketPass) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.ticketCode)}`;
  
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download your PDF ticket.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket - ${ticket.eventTitle} (${ticket.ticketCode})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .ticket-card {
            background: #1e293b;
            border: 2px solid #334155;
            border-radius: 24px;
            max-w: 600px;
            width: 100%;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
          }
          .header {
            border-bottom: 2px dashed #475569;
            padding-bottom: 20px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand {
            font-size: 20px;
            font-weight: 900;
            color: #00c896;
            letter-spacing: 1px;
          }
          .status-badge {
            background: #059669;
            color: #ffffff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .event-title {
            font-size: 24px;
            font-weight: 900;
            margin: 0 0 8px 0;
            color: #ffffff;
          }
          .tier-badge {
            display: inline-block;
            background: rgba(0, 200, 150, 0.15);
            color: #00c896;
            border: 1px solid rgba(0, 200, 150, 0.3);
            padding: 4px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 20px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
            background: #0f172a;
            padding: 20px;
            border-radius: 16px;
          }
          .detail-item label {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .detail-item span {
            font-size: 14px;
            font-weight: 800;
            color: #ffffff;
          }
          .qr-section {
            text-align: center;
            background: #ffffff;
            padding: 24px;
            border-radius: 20px;
            color: #0f172a;
          }
          .qr-section img {
            width: 180px;
            height: 180px;
          }
          .qr-code-text {
            font-family: monospace;
            font-size: 18px;
            font-weight: 900;
            margin-top: 10px;
            letter-spacing: 2px;
            color: #0f172a;
          }
          .footer-note {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            body { background: #ffffff; color: #000000; padding: 0; }
            .ticket-card { border: 2px solid #000; background: #fff; color: #000; box-shadow: none; }
            .event-title { color: #000; }
            .details-grid { background: #f1f5f9; }
            .detail-item span { color: #000; }
            .tier-badge { background: #e2e8f0; color: #000; border-color: #cbd5e1; }
            .brand { color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="header">
            <div class="brand">TICKETA PASS</div>
            <div class="status-badge">${ticket.status === 'CHECKED_IN' ? 'CHECKED IN' : 'OFFICIAL PASS'}</div>
          </div>

          <div class="event-title">${ticket.eventTitle}</div>
          <div class="tier-badge">${ticket.tierName} TICKET PASS</div>

          <div class="details-grid">
            <div class="detail-item">
              <label>Attendee Name</label>
              <span>${ticket.attendeeName}</span>
            </div>
            <div class="detail-item">
              <label>Date & Time</label>
              <span>${ticket.eventDate || 'Event Date'} • ${ticket.eventTime || 'Door Time'}</span>
            </div>
            <div class="detail-item">
              <label>Venue / Location</label>
              <span>${ticket.venueName}</span>
            </div>
            <div class="detail-item">
              <label>Order Reference</label>
              <span>${ticket.orderId}</span>
            </div>
          </div>

          <div class="qr-section">
            <img src="${qrUrl}" alt="QR Ticket" />
            <div class="qr-code-text">${ticket.ticketCode}</div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 4px;">
              Present this code at main gate check-in scanner
            </div>
          </div>

          <div class="footer-note">
            Non-transferable official event pass • Issued by Ticketa Event Systems
          </div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Exports a ticket pass formatted for Apple Wallet (.pkpass / Apple Passbook card file).
 */
export const exportTicketToAppleWallet = (ticket: TicketPass) => {
  const passData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.ticketa.eventpass',
    serialNumber: ticket.ticketCode,
    teamIdentifier: 'TICKETA99',
    organizationName: 'Ticketa Events',
    description: `${ticket.eventTitle} - ${ticket.tierName}`,
    logoText: 'TICKETA',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(15, 23, 42)',
    labelColor: 'rgb(0, 200, 150)',
    eventTicket: {
      primaryFields: [
        {
          key: 'event',
          label: 'EVENT',
          value: ticket.eventTitle,
        },
      ],
      secondaryFields: [
        {
          key: 'attendee',
          label: 'PASS HOLDER',
          value: ticket.attendeeName,
        },
        {
          key: 'tier',
          label: 'TIER',
          value: ticket.tierName,
        },
      ],
      auxiliaryFields: [
        {
          key: 'venue',
          label: 'VENUE',
          value: ticket.venueName,
        },
        {
          key: 'time',
          label: 'DATE & TIME',
          value: `${ticket.eventDate || ''} ${ticket.eventTime || ''}`,
        },
      ],
      backFields: [
        {
          key: 'serial',
          label: 'Ticket Serial',
          value: ticket.ticketCode,
        },
        {
          key: 'order',
          label: 'Order Reference',
          value: ticket.orderId,
        },
        {
          key: 'info',
          label: 'Important Gate Instructions',
          value: 'Show barcode to gate scanner upon arrival. Keep screen brightness high.',
        },
      ],
    },
    barcode: {
      message: ticket.ticketCode,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: ticket.ticketCode,
    },
    barcodes: [
      {
        message: ticket.ticketCode,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: ticket.ticketCode,
      },
    ],
  };

  const blob = new Blob([JSON.stringify(passData, null, 2)], {
    type: 'application/vnd.apple.pkpass+json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${ticket.ticketCode}-apple-wallet.pkpass`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sends a high-contrast monochrome print job formatted for thermal printers
 * (Zebra ZD510-HC 1"x11" Wristbands, Epson ESC/POS 80mm/58mm rolls, and Lanyard Badges).
 */
export const printThermalWristband = (
  ticket: TicketPass,
  options: {
    format?: 'WRISTBAND_1X11' | 'BADGE_3X4' | 'RECEIPT_80MM';
    gateName?: string;
    autoClose?: boolean;
  } = {}
) => {
  const { format = 'WRISTBAND_1X11', gateName = 'Gate #1 Main Entrance' } = options;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(ticket.ticketCode)}`;
  const timeNow = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

  const printWindow = window.open('', '_blank', 'width=900,height=500');
  if (!printWindow) {
    alert('Please allow popups to execute thermal wristband printing.');
    return;
  }

  const isWristband = format === 'WRISTBAND_1X11';
  const isBadge = format === 'BADGE_3X4';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Print - ${ticket.ticketCode}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&family=Public+Sans:wght@700;900&display=swap');
          
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          body {
            font-family: 'Public Sans', system-ui, -apple-system, sans-serif;
            background: #e2e8f0;
            color: #000000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          /* Thermal Container */
          .thermal-preview {
            background: #ffffff;
            color: #000000;
            border: 2px solid #000000;
            position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }

          /* 1" x 11" Zebra Wristband Format (280mm x 26mm) */
          .format-wristband {
            width: 780px;
            height: 90px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            padding: 8px 16px;
            gap: 16px;
          }

          /* 3" x 4" Lanyard Badge Format */
          .format-badge {
            width: 320px;
            height: 440px;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
          }

          /* 80mm Roll Receipt Format */
          .format-receipt {
            width: 280px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .brand-tag {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 2px;
          }

          .tier-box {
            background: #000000;
            color: #ffffff;
            font-weight: 900;
            font-size: 14px;
            padding: 4px 10px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
          }

          .attendee-name {
            font-size: 20px;
            font-weight: 900;
            line-height: 1.1;
            text-transform: uppercase;
          }

          .event-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #222222;
          }

          .meta-info {
            font-size: 9px;
            font-weight: 700;
            font-family: monospace;
          }

          .barcode-text {
            font-family: 'Libre Barcode 128', monospace;
            font-size: 38px;
            line-height: 1;
          }

          /* Printable Stylesheet for Thermal Drivers */
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .thermal-preview {
              border: none;
              box-shadow: none;
            }
            @page {
              margin: 0;
              ${isWristband ? 'size: 280mm 26mm landscape;' : isBadge ? 'size: 3in 4in portrait;' : 'size: 80mm auto;'}
            }
          }
        </style>
      </head>
      <body>
        
        ${isWristband ? `
          <div class="thermal-preview format-wristband">
            <!-- Adhesive / Tail Zone -->
            <div style="border-right: 2px dashed #000; padding-right: 12px; height: 100%; display: flex; flex-direction: column; justify-content: center; font-size: 9px; font-weight: 900; width: 70px; text-align: center; background: #f1f5f9;">
              <span>SECURITY</span>
              <span>VOID IF</span>
              <span>REMOVED</span>
            </div>

            <!-- Pass QR & Barcode -->
            <div style="display: flex; items-center; gap: 8px;">
              <img src="${qrUrl}" style="width: 65px; height: 65px; border: 1px solid #000;" />
            </div>

            <!-- Attendee & Event Details -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="brand-tag">TICKETA GATE WRISTBAND</span>
                <span class="tier-box">${ticket.tierName}</span>
              </div>
              <div class="attendee-name">${ticket.attendeeName}</div>
              <div class="event-title">${ticket.eventTitle} • ${ticket.venueName}</div>
            </div>

            <!-- Serial Code & Gate Checkin Info -->
            <div style="border-left: 2px solid #000; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 2px; width: 150px;">
              <div style="font-family: monospace; font-weight: 900; font-size: 13px;">${ticket.ticketCode}</div>
              <div class="meta-info">Gate: ${gateName}</div>
              <div class="meta-info">Printed: ${timeNow}</div>
            </div>
          </div>
        ` : isBadge ? `
          <div class="thermal-preview format-badge">
            <div style="border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
              <div class="brand-tag" style="font-size: 14px;">TICKETA OFFICIAL VENUE PASS</div>
              <div class="event-title" style="font-size: 15px; margin-top: 4px;">${ticket.eventTitle}</div>
            </div>

            <div style="margin: 12px 0;">
              <div class="tier-box" style="font-size: 18px; padding: 6px 16px; margin-bottom: 12px;">${ticket.tierName} ACCESS</div>
              <div class="attendee-name" style="font-size: 26px;">${ticket.attendeeName}</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 4px; color: #333;">${ticket.venueName}</div>
            </div>

            <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 12px 0; margin: 8px 0; display: flex; justify-content: center; items-center; gap: 12px;">
              <img src="${qrUrl}" style="width: 100px; height: 100px; border: 2px solid #000;" />
              <div style="text-align: left; font-size: 11px; font-weight: 700; font-family: monospace; space-y: 2px;">
                <div>PASS: <strong style="font-size: 13px;">${ticket.ticketCode}</strong></div>
                <div>ORDER: ${ticket.orderId}</div>
                <div>GATE: ${gateName}</div>
                <div>DATE: ${ticket.eventDate || timeNow}</div>
              </div>
            </div>

            <div style="font-size: 9px; font-weight: 900; text-transform: uppercase;">
              Security Seal • Do Not Remove Badge From Neck Lanyard
            </div>
          </div>
        ` : `
          <!-- Receipt Roll 80mm -->
          <div class="thermal-preview format-receipt">
            <div class="brand-tag" style="font-size: 14px;">TICKETA GATE PASS</div>
            <div class="event-title" style="font-size: 14px;">${ticket.eventTitle}</div>
            <div class="tier-box">${ticket.tierName} TICKET</div>
            <div class="attendee-name" style="font-size: 22px;">${ticket.attendeeName}</div>
            <img src="${qrUrl}" style="width: 150px; height: 150px; margin: 8px auto; border: 2px solid #000;" />
            <div style="font-family: monospace; font-weight: 900; font-size: 16px;">${ticket.ticketCode}</div>
            <div class="meta-info">Gate: ${gateName} | Time: ${timeNow}</div>
          </div>
        `}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

