import { corsair } from './corsair';

// Types for Email object returned by list/get
export interface EmailPayload {
  gmail_id: string;
  thread_id: string;
  from_address: string;
  from_name: string;
  to_addresses: { address: string; name?: string }[];
  subject: string;
  snippet: string;
  body_text: string;
  body_html: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
}

// Construct a raw base64url MIME message for Gmail send
function buildMimeMessage({
  to,
  subject,
  bodyHtml,
  threadId,
  messageId,
  references,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  threadId?: string;
  messageId?: string;
  references?: string;
}): string {
  const headers: string[] = [
    `To: ${to}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
  ];

  if (threadId && messageId) {
    headers.push(`In-Reply-To: ${messageId}`);
    headers.push(`References: ${references ? `${references} ${messageId}` : messageId}`);
  }

  // Base64 encode the body HTML (since content transfer encoding is base64)
  const base64Body = Buffer.from(bodyHtml).toString('base64');
  
  // Format body with line breaks every 76 chars (standard MIME base64)
  const formattedBody = base64Body.match(/.{1,76}/g)?.join('\r\n') || base64Body;

  const email = [...headers, '', formattedBody].join('\r\n');

  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function listGmailEmails(q?: string, maxResults = 20) {
  const response = await corsair.gmail.api.messages.list({
    userId: 'me',
    q,
    maxResults,
  });

  return response.messages || [];
}

export async function getGmailEmailDetail(id: string) {
  const message = await corsair.gmail.api.messages.get({
    userId: 'me',
    id,
    format: 'full',
  });

  return message;
}

export async function sendGmailEmail(to: string, subject: string, bodyHtml: string) {
  const raw = buildMimeMessage({ to, subject, bodyHtml });
  
  return await corsair.gmail.api.messages.send({
    userId: 'me',
    raw,
  });
}

export async function replyToGmailEmail(threadId: string, parentMessageId: string, to: string, subject: string, bodyHtml: string) {
  // Retrieve the parent message to construct headers properly if needed
  let messageIdHeader: string | undefined;
  let referencesHeader: string | undefined;

  try {
    const parentMsg = await getGmailEmailDetail(parentMessageId);
    const headers = parentMsg.payload?.headers || [];
    messageIdHeader = headers.find((h: any) => h.name.toLowerCase() === 'message-id')?.value;
    referencesHeader = headers.find((h: any) => h.name.toLowerCase() === 'references')?.value;
  } catch (err) {
    console.error('Failed to get parent email detail, replying with default headers', err);
  }

  // Ensure subject starts with Re:
  const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;

  const raw = buildMimeMessage({
    to,
    subject: replySubject,
    bodyHtml,
    threadId,
    messageId: messageIdHeader,
    references: referencesHeader,
  });

  return await corsair.gmail.api.messages.send({
    userId: 'me',
    raw,
    threadId,
  });
}

export async function archiveGmailEmail(id: string) {
  // Remove 'INBOX' label using modify endpoint
  return await corsair.gmail.api.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['INBOX'],
  });
}

export async function trashGmailEmail(id: string) {
  return await corsair.gmail.api.messages.trash({
    userId: 'me',
    id,
  });
}

export async function modifyGmailEmailLabels(id: string, addLabelIds?: string[], removeLabelIds?: string[]) {
  return await corsair.gmail.api.messages.modify({
    userId: 'me',
    id,
    addLabelIds,
    removeLabelIds,
  });
}

function parseHeader(headers: { name: string; value: string }[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function parseAddressList(header: string) {
  if (!header) return [];
  return header.split(',').map((t: string) => {
    const addr = t.match(/<([^>]+)>/)?.[1] || t.trim();
    const name = t.split('<')[0]?.replace(/"/g, '').trim() || '';
    return { address: addr, name: name || undefined };
  }).filter((t) => t.address);
}

export function parseMimeBody(part: any): { text: string; html: string } {
  let text = '';
  let html = '';
  if (!part) return { text, html };

  if (part.mimeType === 'text/plain' && part.body?.data) {
    text = Buffer.from(part.body.data, 'base64').toString('utf8');
  } else if (part.mimeType === 'text/html' && part.body?.data) {
    html = Buffer.from(part.body.data, 'base64').toString('utf8');
  } else if (part.parts) {
    part.parts.forEach((p: any) => {
      const res = parseMimeBody(p);
      if (res.text) text += res.text + '\n';
      if (res.html) html += res.html + '\n';
    });
  }
  return { text, html };
}

export function labelToGmailQuery(label: string): string {
  switch (label) {
    case 'INBOX':
      return 'in:inbox';
    case 'SENT':
      return 'in:sent';
    case 'ARCHIVED':
      return '-in:inbox -in:trash -in:drafts';
    case 'STARRED':
      return 'is:starred';
    case 'TRASH':
      return 'in:trash';
    default:
      return 'in:inbox';
  }
}

export function parseGmailMessage(detail: any, options?: { includeBody?: boolean }) {
  const headers = detail.payload?.headers || [];
  const subject = parseHeader(headers, 'subject') || '(No Subject)';
  const fromHeader = parseHeader(headers, 'from');
  const fromName = fromHeader.split('<')[0]?.replace(/"/g, '').trim() || fromHeader;
  const fromAddress = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;
  const toHeader = parseHeader(headers, 'to');
  const toAddresses = parseAddressList(toHeader);
  const labels = detail.labelIds || [];
  const isRead = !labels.includes('UNREAD');
  const isStarred = labels.includes('STARRED');
  const receivedAt = detail.internalDate
    ? new Date(parseInt(detail.internalDate, 10)).toISOString()
    : new Date().toISOString();

  let bodyText = '';
  let bodyHtml = '';
  if (options?.includeBody !== false) {
    const parsed = parseMimeBody(detail.payload);
    bodyText = parsed.text || detail.snippet || '';
    bodyHtml = parsed.html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${bodyText}</div>`;
  }

  return {
    gmail_id: detail.id,
    thread_id: detail.threadId,
    from_address: fromAddress,
    from_name: fromName,
    to_addresses: toAddresses,
    subject,
    snippet: detail.snippet || '',
    body_text: bodyText,
    body_html: bodyHtml,
    labels,
    is_read: isRead,
    is_starred: isStarred,
    received_at: receivedAt,
  };
}

export async function getGmailMessageSummary(id: string) {
  const message = await corsair.gmail.api.messages.get({
    userId: 'me',
    id,
    format: 'metadata',
    metadataHeaders: ['From', 'To', 'Subject', 'Date'],
  });
  return parseGmailMessage(message, { includeBody: false });
}
