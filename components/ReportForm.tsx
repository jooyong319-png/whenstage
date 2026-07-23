'use client';
import { useState } from 'react';
import { submitReport, reportsConfigured, type ReportKind, type ReportTargetType } from '@/lib/reports';
import { showToast } from '@/lib/toast';
import styles from './ReportForm.module.css';

interface Props {
  kind: ReportKind;
  targetType: ReportTargetType;
  targetId: string;
  locale: string;
  buttonLabel: string;
  placeholder: string;
  successLabel: string;
  submitLabel: string;
  contactLabel: string;
  cancelLabel: string;
}

// 사용자 제보 폼 — 평소엔 버튼 하나(펼치면 텍스트영역+선택 이메일). 콘서트 상세(예매 링크
// 제보/정정)와 아티스트 상세(정보 수정·등록) 둘 다에서 재사용. 관리자가 확인 후 실제
// data/*.json에 반영하는 수동 검토 흐름이라, 제출 즉시 사이트에 반영되진 않는다는 걸
// successLabel 문구로 분명히 한다.
export function ReportForm({ kind, targetType, targetId, locale, buttonLabel, placeholder, successLabel, submitLabel, contactLabel, cancelLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!reportsConfigured()) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    const r = await submitReport({ kind, targetType, targetId, locale, message, contact });
    setSubmitting(false);
    if (r.ok) {
      setDone(true);
      setMessage('');
      setContact('');
      showToast(successLabel);
    } else {
      showToast(`${submitLabel} 실패: ${r.error ?? '알 수 없음'}`, 5000);
    }
  };

  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => { setOpen(true); setDone(false); }}>
        <svg className="ic" aria-hidden="true"><use href="#ic-tag" /></svg>
        {buttonLabel}
      </button>
    );
  }

  return (
    <form className={styles.box} onSubmit={onSubmit}>
      {done ? (
        <p className={styles.done}>{successLabel}</p>
      ) : (
        <>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            rows={3}
            required
          />
          <input
            type="email"
            className={styles.contact}
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder={contactLabel}
          />
        </>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>{cancelLabel}</button>
        {!done && (
          <button type="submit" className={styles.submit} disabled={submitting || !message.trim()}>
            {submitting ? '…' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
