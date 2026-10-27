// src/app/legal/page.tsx
import type { Metadata } from 'next';
import { CONTACT_MAILTO, DISCLOSE_ON_REQUEST, OPERATOR, SERVICE_LEGAL } from '@/config/legal';
import { ExtLink, LegalLayout, LegalTable } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: `${SERVICE_LEGAL.serviceName}の特定商取引法に基づく表記です。`,
};

export default function LegalPage() {
  const rows = [
    { label: '販売事業者', value: `${OPERATOR.businessName}（個人事業）` },
    { label: '運営責任者', value: DISCLOSE_ON_REQUEST },
    { label: '所在地', value: <>{OPERATOR.location}<br />詳細な住所は、{DISCLOSE_ON_REQUEST}</> },
    { label: '電話番号', value: <>{DISCLOSE_ON_REQUEST}<br />お問い合わせは、メールまたはお問い合わせフォームでお願いします。</> },
    { label: 'メールアドレス', value: <a href={CONTACT_MAILTO} className="text-blue-600 hover:underline break-all">{OPERATOR.email}</a> },
    { label: 'お問い合わせ', value: <ExtLink href={OPERATOR.contactUrl}>お問い合わせフォーム</ExtLink> },
    { label: '販売URL', value: <ExtLink href={SERVICE_LEGAL.siteUrl}>{SERVICE_LEGAL.siteUrl}</ExtLink> },
    { label: '販売価格', value: SERVICE_LEGAL.price },
    {
      label: '商品代金以外の必要料金',
      value: (
        <ul className="list-disc pl-5 space-y-1">
          <li>インターネットの接続料金・通信料金</li>
          <li>お住まいの国・地域によっては、決済時に消費税等が加算される場合があります</li>
          <li>外貨建ての決済となるため、カード会社等の為替手数料がかかる場合があります</li>
        </ul>
      ),
    },
    { label: '支払方法', value: '決済サービス「Gumroad」で利用できる方法（クレジットカード、PayPal等）' },
    { label: '支払時期', value: '購入手続きの完了時にお支払いが確定します。引き落とし日は、ご利用のカード会社等の規約によります。' },
    { label: '引渡時期', value: SERVICE_LEGAL.delivery },
    { label: '提供期間', value: SERVICE_LEGAL.licensePeriod },
    {
      label: '返品・キャンセル',
      value: (
        <div className="space-y-2">
          {SERVICE_LEGAL.refund.map(text => <p key={text}>{text}</p>)}
        </div>
      ),
    },
    { label: '動作環境', value: SERVICE_LEGAL.environment },
    { label: '決済代行', value: 'Gumroad, Inc.（米国）' },
  ];

  return (
    <LegalLayout title="特定商取引法に基づく表記">
      <LegalTable rows={rows} />
      <p className="text-xs text-slate-500">
        運営責任者の氏名・住所・電話番号は、特定商取引法に基づき、ご請求があった場合に遅滞なく電子メールで開示します。上記のメールアドレスまで、件名に「[FirstScope]」を付けてご連絡ください。
      </p>
    </LegalLayout>
  );
}
